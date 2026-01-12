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

const phoneRegex = new RegExp(
  /^\(?([0-9]{2})\)?(\s|-)?(9[0-9]{4})-?([0-9]{4})$/
);

const FormSchema = z.object({
  nome: z.string().min(2, {
    message: 'O nome deve ter pelo menos 2 caracteres.',
  }),
  telefone: z.string().regex(phoneRegex, {
    message: 'Formato: (99) 99999-9999',
  }),
});

export default function StepOne({ nextStep, updateFormData, formData }: StepOneProps) {
  const [prizeClaimed, setPrizeClaimed] = useState(false);
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
      formatted += `) ${input.substring(2, 7)}`;
      if (input.length > 7) {
        formatted += `-${input.substring(7, 11)}`;
      }
    }
    form.setValue('telefone', formatted);
    if (prizeClaimed) {
      setPrizeClaimed(false); // Reset on change
    }
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setChecking(true);
    setPrizeClaimed(false);
    updateFormData(data);

    if (!firestore) {
      console.error("Firestore not available");
      setChecking(false);
      return;
    }

    const prizeDocId = data.telefone.replace(/\D/g, '');
    const prizeClaimRef = doc(firestore, 'prize_claims', prizeDocId);
    
    try {
      const docSnap = await getDoc(prizeClaimRef);
      
      if (docSnap.exists()) {
        setPrizeClaimed(true);
        setChecking(false);
        return; // STOP EXECUTION HERE
      }
      
      // Only proceed if doc does not exist
      nextStep();

    } catch (error) {
      console.error("Error checking prize claim:", error);
      // Let's be safe and let the user proceed if there's a check error.
      // The backend rules will still prevent a duplicate claim.
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
                    <Input placeholder="Digite seu nome" {...field} disabled={prizeClaimed} />
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
                      disabled={prizeClaimed}
                     />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {prizeClaimed ? (
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
