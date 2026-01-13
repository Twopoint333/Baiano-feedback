'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type FieldErrors } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useState, useTransition } from 'react';
import type { FormData } from '@/app/page';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { useFirebase, setDocumentNonBlocking } from '@/firebase';


import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { StarRating } from '@/components/star-rating';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, Loader2 } from 'lucide-react';

interface StepThreeProps {
  nextStep: () => void;
  updateFormData: (data: Partial<FormData>) => void;
  formData: FormData;
}

const SurveySchema = z.object({
  comoNosConheceu: z.enum(['Google', 'Presencialmente', 'Mais delivery', 'Instagram', 'Blogueira'], { required_error: 'Campo obrigatório.' }),
  blogueiraNome: z.string().optional(),
  avaliacaoGeral: z.number().min(1, { message: 'Por favor, dê uma nota.' }).max(5),
  atendimento: z.enum(['Excelente', 'Bom', 'Regular', 'Ruim'], { required_error: 'Campo obrigatório.' }),
  agilidade: z.enum(['Muito rápido', 'Dentro do esperado', 'Demorado'], { required_error: 'Campo obrigatório.' }),
  burger: z.enum(['Perfeito 🔥', 'Bom 👍', 'Poderia melhorar 🤔'], { required_error: 'Campo obrigatório.' }),
  melhoriaBurger: z.string().optional(),
  sugestao: z.string().optional(),
}).refine(data => !(data.comoNosConheceu === 'Blogueira' && !data.blogueiraNome), {
  message: "Por favor, informe o nome da blogueira.",
  path: ['blogueiraNome'],
}).superRefine((data, ctx) => {
  if (
    data.burger === 'Poderia melhorar 🤔' &&
    (!data.melhoriaBurger || data.melhoriaBurger.trim() === '')
  ) {
    ctx.addIssue({
      path: ['melhoriaBurger'],
      message: 'Sua opinião é muito importante para nós. Conte o que podemos melhorar.',
      code: z.ZodIssueCode.custom,
    });
  }
});


type SurveyFormData = z.infer<typeof SurveySchema>;

const questions: (keyof SurveyFormData)[] = [
  'comoNosConheceu',
  'avaliacaoGeral',
  'atendimento',
  'agilidade',
  'burger',
];

const questionOrder: (keyof SurveyFormData)[] = [
  'comoNosConheceu',
  'avaliacaoGeral',
  'atendimento',
  'agilidade',
  'burger',
  'melhoriaBurger',
  'sugestao',
];


const comoNosConheceuOptions = ['Google', 'Presencialmente', 'Mais delivery', 'Instagram', 'Blogueira'];

export default function StepThree({ nextStep, formData, updateFormData }: StepThreeProps) {
  const [progress, setProgress] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  const form = useForm<SurveyFormData>({
    resolver: zodResolver(SurveySchema),
    defaultValues: {
      comoNosConheceu: formData.comoNosConheceu || undefined,
      blogueiraNome: formData.blogueiraNome || '',
      avaliacaoGeral: formData.avaliacaoGeral || 0,
      atendimento: formData.atendimento || undefined,
      agilidade: formData.agilidade || undefined,
      burger: formData.burger || undefined,
      melhoriaBurger: formData.melhoriaBurger || '',
      sugestao: formData.sugestao || '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const watchedFields = form.watch();

  useEffect(() => {
    const answeredCount = questions.filter(q => {
      const value = watchedFields[q as keyof SurveyFormData];
      return value !== undefined && value !== 0 && value !== '';
    }).length;
    setProgress((answeredCount / questions.length) * 100);
  }, [watchedFields]);

  const onInvalid = (errors: FieldErrors<SurveyFormData>) => {
    const firstErrorField = questionOrder.find(field => errors[field]);
    if (firstErrorField) {
      const fieldRef = (form.control._fields[firstErrorField] as any)?._f.ref;
      let element: HTMLElement | null = null;
  
      if (fieldRef) {
        if (fieldRef.closest) {
          element = fieldRef;
        }
      }
  
      if (element) {
        element.closest('[data-form-item-container]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const namedElement = document.getElementsByName(firstErrorField)[0];
        if (namedElement) {
          namedElement.closest('[data-form-item-container]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const onSubmit = (data: SurveyFormData) => {
    const fullData = { ...formData, ...data };
    updateFormData(fullData);
    
    startTransition(() => {
      const surveyDocId = fullData.telefone.replace(/\D/g, '');
      if (!firestore || !surveyDocId || !user) {
        toast({
          variant: 'destructive',
          title: "Erro!",
          description: "Não foi possível salvar a pesquisa. Usuário ou telefone inválido.",
        });
        return;
      }
      
      const surveyDocRef = doc(firestore, 'survey_responses', surveyDocId);
      
      const dataToSave = {
        uid: user.uid,
        nome: fullData.nome,
        telefone: fullData.telefone,
        avaliacaoGeral: fullData.avaliacaoGeral,
        atendimento: fullData.atendimento,
        agilidade: fullData.agilidade,
        burger: fullData.burger,
        melhoriaBurger:
          fullData.burger === 'Poderia melhorar 🤔'
            ? fullData.melhoriaBurger || null
            : null,
        sugestao: fullData.sugestao || null,
        comoNosConheceu: fullData.comoNosConheceu,
        blogueiraNome: fullData.blogueiraNome || null,
        createdAt: serverTimestamp(),
      };

      setDocumentNonBlocking(surveyDocRef, dataToSave, { merge: true });
      
      toast({
        title: "Sucesso!",
        description: "Sua pesquisa foi enviada.",
      });
      nextStep();
    });
  };

  const renderRadioGroup = (name: keyof SurveyFormData, label: string, options: string[]) => (
    <FormField
      control={form.control}
      name={name as any}
      render={({ field }) => (
        <FormItem data-form-item-container className="space-y-3 text-left p-4 border rounded-lg bg-card">
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
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
            <FormField
                control={form.control}
                name="comoNosConheceu"
                render={({ field }) => (
                  <FormItem data-form-item-container className="space-y-3 text-left p-4 border rounded-lg bg-card">
                    <FormLabel className="text-base font-semibold">Por onde você nos conheceu?</FormLabel>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                      <DialogTrigger asChild>
                        <FormControl>
                          <Button ref={field.ref} variant="outline" className="w-full justify-between">
                            {field.value ? (
                              <span>
                                {field.value}
                                {field.value === 'Blogueira' && watchedFields.blogueiraNome && `: ${watchedFields.blogueiraNome}`}
                              </span>
                            ) : 'Selecione uma opção'}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Por onde você nos conheceu?</DialogTitle>
                        </DialogHeader>
                        <RadioGroup
                          onValueChange={(value) => {
                            field.onChange(value);
                            if (value !== 'Blogueira') {
                              form.setValue('blogueiraNome', '');
                            }
                          }}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2 py-4"
                        >
                          {comoNosConheceuOptions.map((option) => (
                            <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={option} />
                              </FormControl>
                              <FormLabel className="font-normal text-base">{option}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                        {watchedFields.comoNosConheceu === 'Blogueira' && (
                           <FormField
                            control={form.control}
                            name="blogueiraNome"
                            render={({ field: blogueiraField }) => (
                              <FormItem className="animate-in fade-in-50 duration-300">
                                <FormLabel>Nome da/do blogueira(o)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: @baianoburger" {...blogueiraField} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button">Confirmar</Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name="avaliacaoGeral"
                render={({ field: { onChange, value } }) => (
                  <FormItem data-form-item-container className="space-y-3 text-left p-4 border rounded-lg bg-card">
                    <FormLabel className="text-base font-semibold">Como você avalia o Baiano Burger?</FormLabel>
                    <FormControl>
                       <StarRating value={value} onValueChange={onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {renderRadioGroup('atendimento', 'Como foi o atendimento?', ['Excelente', 'Bom', 'Regular', 'Ruim'])}
              
              {renderRadioGroup('agilidade', 'Agilidade no preparo do pedido', ['Muito rápido', 'Dentro do esperado', 'Demorado'])}
              
              <div data-form-item-container className="space-y-3 text-left p-4 border rounded-lg bg-card">
                {renderRadioGroup('burger', 'Como estava o seu burger?', ['Perfeito 🔥', 'Bom 👍', 'Poderia melhorar 🤔'])}
                {watchedFields.burger === 'Poderia melhorar 🤔' && (
                  <FormField
                    control={form.control}
                    name="melhoriaBurger"
                    render={({ field }) => (
                      <FormItem className="animate-in fade-in-50 duration-300 pt-4">
                        <FormLabel>Nos conte aqui como podemos melhorar, sua opinião é muito importante para nós</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Seu feedback nos ajuda a crescer..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="sugestao"
                render={({ field }) => (
                  <FormItem data-form-item-container className="text-left p-4 border rounded-lg bg-card">
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
