'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { FormData } from '@/app/page';

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
import React from 'react';

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
  };


  function onSubmit(data: z.infer<typeof FormSchema>) {
    updateFormData(data);
    nextStep();
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
                    <Input placeholder="Digite seu nome" {...field} />
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
                     />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full font-bold text-base py-6">
              Continuar
            </Button>
            <p className="text-xs text-muted-foreground pt-2">
              Seus dados são usados apenas para controle da pesquisa e entrega do prêmio.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
