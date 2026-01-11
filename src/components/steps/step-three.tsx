'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useState, useTransition } from 'react';
import type { FormData } from '@/app/page';
import { saveSurvey } from '@/app/actions';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { StarRating } from '@/components/star-rating';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface StepThreeProps {
  nextStep: () => void;
  updateFormData: (data: Partial<FormData>) => void;
  formData: FormData;
}

const SurveySchema = z.object({
  comoNosConheceu: z.enum(['Instagram', 'indicação', 'outros'], { required_error: 'Campo obrigatório.' }),
  avaliacaoGeral: z.number().min(1, { message: 'Por favor, dê uma nota.' }).max(5),
  atendimento: z.enum(['Excelente', 'Bom', 'Regular', 'Ruim'], { required_error: 'Campo obrigatório.' }),
  agilidade: z.enum(['Muito rápido', 'Dentro do esperado', 'Demorado'], { required_error: 'Campo obrigatório.' }),
  burger: z.enum(['Perfeito 🔥', 'Bom 👍', 'Poderia melhorar 🤔'], { required_error: 'Campo obrigatório.' }),
  sugestao: z.string().optional(),
});

type SurveyFormData = z.infer<typeof SurveySchema>;

const questions: (keyof SurveyFormData)[] = [
  'comoNosConheceu',
  'avaliacaoGeral',
  'atendimento',
  'agilidade',
  'burger',
];

export default function StepThree({ nextStep, formData, updateFormData }: StepThreeProps) {
  const [progress, setProgress] = useState(0);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<SurveyFormData>({
    resolver: zodResolver(SurveySchema),
    defaultValues: {
      comoNosConheceu: formData.comoNosConheceu || undefined,
      avaliacaoGeral: formData.avaliacaoGeral || 0,
      atendimento: formData.atendimento || undefined,
      agilidade: formData.agilidade || undefined,
      burger: formData.burger || undefined,
      sugestao: formData.sugestao || '',
    },
  });

  const watchedFields = form.watch(questions);

  useEffect(() => {
    const answeredCount = watchedFields.filter(val => val !== undefined && val !== 0 && val !== '').length;
    setProgress((answeredCount / questions.length) * 100);
  }, [watchedFields]);

  const onSubmit = (data: SurveyFormData) => {
    const fullData = { ...formData, ...data };
    updateFormData(fullData);
    
    startTransition(async () => {
      const result = await saveSurvey(fullData);
      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Sua pesquisa foi enviada.",
        });
        nextStep();
      } else {
        toast({
          variant: 'destructive',
          title: "Erro!",
          description: result.error,
        });
      }
    });
  };

  const renderRadioGroup = (name: keyof SurveyFormData, label: string, options: string[]) => (
    <FormField
      control={form.control}
      name={name as any}
      render={({ field }) => (
        <FormItem className="space-y-3 text-left p-4 border rounded-lg bg-card">
          <FormLabel className="text-base font-semibold">{label}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-2"
            >
              {options.map((option) => (
                <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value={option} />
                  </FormControl>
                  <FormLabel className="font-normal text-base">{option}</FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
  
  return (
    <div className="w-full animate-in fade-in-50 duration-500">
      <Card className="w-full border-none shadow-none bg-transparent">
        <CardHeader className="px-0">
          <Progress value={progress} className="w-full h-2" />
        </CardHeader>
        <CardContent className="p-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {renderRadioGroup('comoNosConheceu', 'Por onde você nos conheceu?', ['Instagram', 'indicação', 'outros'])}

              <FormField
                control={form.control}
                name="avaliacaoGeral"
                render={({ field }) => (
                  <FormItem className="space-y-3 text-left p-4 border rounded-lg bg-card">
                    <FormLabel className="text-base font-semibold">Como você avalia o Baiano Burger?</FormLabel>
                    <FormControl>
                       <StarRating value={field.value} onValueChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {renderRadioGroup('atendimento', 'Como foi o atendimento?', ['Excelente', 'Bom', 'Regular', 'Ruim'])}
              
              {renderRadioGroup('agilidade', 'Agilidade no preparo do pedido', ['Muito rápido', 'Dentro do esperado', 'Demorado'])}
              
              {renderRadioGroup('burger', 'Como estava o seu burger?', ['Perfeito 🔥', 'Bom 👍', 'Poderia melhorar 🤔'])}

              <FormField
                control={form.control}
                name="sugestao"
                render={({ field }) => (
                  <FormItem className="text-left p-4 border rounded-lg bg-card">
                    <FormLabel className="text-base font-semibold">Sugestões (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Deixe aqui sua sugestão para melhorarmos..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full font-bold text-base py-6" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar respostas
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
