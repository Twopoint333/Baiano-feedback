'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { FormData } from '@/app/page';
import React, { useState } from 'react';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface StepOneProps {
  nextStep: () => void;
  updateFormData: (data: Partial<FormData>) => void;
  formData: Partial<FormData>;
}

const phoneRegex = /^\(?\d{2}\)?\s?9?\d{4,5}-?\d{4}$/;

const FormSchema = z.object({
  nome: z.string().min(2, {
    message: 'O nome deve ter pelo menos 2 caracteres.',
  }),
  telefone: z.string().refine(value => phoneRegex.test(value), {
    message: 'Formato: (99) 99999-9999',
  }),
});

export default function StepOne({ nextStep, updateFormData, formData }: StepOneProps) {
  const [hasAlreadyParticipated, setHasAlreadyParticipated] = useState(false);
  const [checking, setChecking] = useState(false);
  const { firestore } = useFirebase();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      nome: formData.nome || '',
      telefone: formData.telefone || '',
    },
  });
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '');
    let formatted = '';
    if (input.length > 0) {
      formatted = `(${input.substring(0, 2)}`;
    }
    if (input.length > 2) {
      const remainingLength = input.length - 2;
      const part1Length = remainingLength > 5 ? 5 : remainingLength;
      formatted += `) ${input.substring(2, 2 + part1Length)}`;
      if (remainingLength > 5) {
        formatted += `-${input.substring(7, 11)}`;
      }
    } else if (input.length > 2) {
      formatted += `) ${input.substring(2)}`;
    }
    form.setValue('telefone', formatted);
    if (hasAlreadyParticipated) {
      setHasAlreadyParticipated(false); // Reset on change
    }
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setChecking(true);
    setHasAlreadyParticipated(false);

    if (!firestore) {
      console.error("Firestore not available");
      setChecking(false);
      // Optionally show a user-facing error
      return;
    }
    
    const surveyDocId = data.telefone.replace(/\D/g, '');
    
    try {
      const surveyResponseRef = doc(firestore, 'survey_responses', surveyDocId);
      const docSnap = await getDoc(surveyResponseRef);
      
      if (docSnap.exists()) {
        setHasAlreadyParticipated(true);
        setChecking(false);
        return; // STOP execution here, user has participated.
      }
      
      // If we are here, the user has NOT participated. Proceed.
      updateFormData(data);
      nextStep();

    } catch (error) {
      console.error("Error checking for existing survey response:", error);
      // To be safe, let the user proceed if there's a check error.
      // This is a fallback to avoid blocking users due to network/db issues.
      updateFormData(data);
      nextStep();
    } finally {
        setChecking(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl font-bold">Antes de começar...</CardTitle>
        <CardDescription className="animate-text-color-sweep">conta pra gente rapidinho 👇</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem className="text-left">
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite seu nome" {...field} disabled={hasAlreadyParticipated} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem className="text-left">
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(DDD) 9xxxx-xxxx"
                      {...field}
                      onChange={handlePhoneChange}
                      maxLength={15}
                      disabled={hasAlreadyParticipated}
                     />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {hasAlreadyParticipated ? (
              <Alert variant="default" className="bg-amber-100 border-amber-300 text-amber-900">
                <AlertTitle className="font-bold">Opa, {form.getValues('nome')}!</AlertTitle>
                <AlertDescription>
                  Parece que você já participou. Que tal guardarmos para uma próxima? Agradecemos seu feedback!
                </AlertDescription>
              </Alert>
            ) : (
               <Button type="submit" className="w-full font-bold text-base py-6" disabled={checking}>
                {checking ? <Loader2 className="animate-spin mr-2"/> : null}
                {checking ? 'Verificando...' : 'Continuar'}
              </Button>
            )}

            <p className="text-xs text-muted-foreground pt-2">
              Seus dados são usados apenas para controle da pesquisa e entrega do prêmio.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
