'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirebase, useMemoFirebase } from '@/firebase';
import type { SurveyResponse } from '@/lib/types';
import { Lock, Download, BarChart2, Star, Users, MessageSquare, ThumbsUp, Clock, Coffee, Loader2, FileDown, Share2, Users2 } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, PieChart, Pie, Cell, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart } from 'recharts';
import { Badge } from '@/components/ui/badge';

// --- Senha de Acesso ---
const DASHBOARD_PASSWORD = 'Baiano2k25'; // Senha para acessar o dashboard

// --- Cores para os gráficos ---
const COLORS = ['#90BE6D', '#F9C74F', '#F3722C', '#F94144', '#43AA8B', '#F9844A'];
const RATING_COLORS = ['#F94144', '#F3722C', '#F8961E', '#F9C74F', '#90BE6D'];

// --- Componente de Gráfico de Pizza Genérico ---
const CustomPieChart = ({ data, title, icon: Icon }: { data: any[], title: string, icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie 
                            data={data} 
                            cx="50%" 
                            cy="50%" 
                            labelLine={false} 
                            outerRadius={80} 
                            fill="#8884d8" 
                            dataKey="value" 
                            nameKey="name" 
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} (${(value / data.reduce((acc, curr) => acc + curr.value, 0) * 100).toFixed(1)}%)`, name]}/>
                        <Legend wrapperStyle={{fontSize: '12px'}} />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex h-[250px] items-center justify-center text-muted-foreground">Sem dados</div>
            )}
        </CardContent>
    </Card>
);

export default function Dashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const { firestore } = useFirebase();

    const surveyResponsesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'survey_responses');
    }, [firestore]);

    const { data: surveyResponses, isLoading } = useCollection<SurveyResponse>(surveyResponsesQuery);
    
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === DASHBOARD_PASSWORD) {
            setIsAuthenticated(true);
            setError('');
            sessionStorage.setItem('dashboard_auth', 'true');
        } else {
            setError('Senha incorreta.');
        }
    };
    
    useEffect(() => {
        if (sessionStorage.getItem('dashboard_auth') === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const metrics = useMemo(() => {
        if (!surveyResponses) return null;

        const totalResponses = surveyResponses.length;
        const avgRating = totalResponses > 0 ? surveyResponses.reduce((acc, r) => acc + (r.avaliacaoGeral || 0), 0) / totalResponses : 0;
        
        const processData = (key: keyof SurveyResponse) => {
            const counts = surveyResponses.reduce((acc, r) => {
                const value = r[key] as string;
                if (value) {
                    acc[value] = (acc[value] || 0) + 1;
                }
                return acc;
            }, {} as Record<string, number>);
            return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
        };
        
        const atendimentoData = processData('atendimento');
        const agilidadeData = processData('agilidade');
        const burgerData = processData('burger');
        const comoNosConheceuData = processData('comoNosConheceu');
        
        const blogueiraCounts = surveyResponses
            .filter(r => r.comoNosConheceu === 'Blogueira' && r.blogueiraNome)
            .reduce((acc, r) => {
                const name = r.blogueiraNome!.trim();
                acc[name] = (acc[name] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        const blogueiraData = Object.entries(blogueiraCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        const avaliacaoGeralCounts = surveyResponses.reduce((acc, r) => {
            const rating = r.avaliacaoGeral;
            if (rating) {
                const star = `${rating} estrela${rating > 1 ? 's' : ''}`;
                acc[star] = (acc[star] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const avaliacaoGeralData = Object.keys(avaliacaoGeralCounts).map(name => ({
            name,
            value: avaliacaoGeralCounts[name]
        })).sort((a, b) => parseInt(a.name) - parseInt(b.name));


        return {
            totalResponses,
            avgRating,
            atendimentoData,
            agilidadeData,
            burgerData,
            avaliacaoGeralData,
            comoNosConheceuData,
            blogueiraData
        };
    }, [surveyResponses]);
    
    const handleExportCSV = () => {
        if (!surveyResponses) return;

        const headers = ['Nome', 'Telefone'];
        const rows = surveyResponses.map(r => [r.nome, r.telefone].join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "contatos_baiano_burger.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        if (!surveyResponses) return;

        const doc = new jsPDF();
        doc.text("Respostas Detalhadas - Baiano Burger", 14, 16);
        
        (doc as any).autoTable({
            startY: 22,
            head: [['Nome', 'Telefone', 'Avaliação', 'Atendimento', 'Agilidade', 'Burger', 'Melhoria', 'Sugestão', 'Prêmio']],
            body: surveyResponses.map(r => [
                r.nome,
                r.telefone,
                `${r.avaliacaoGeral} ★`,
                r.atendimento,
                r.agilidade,
                r.burger,
                r.melhoriaBurger || 'N/A',
                r.sugestao || 'N/A',
                r.premioGanho || 'N/A'
            ]),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [249, 65, 68] }, // Cor primária
        });

        doc.save('respostas_baiano_burger.pdf');
    };

    if (!isAuthenticated) {
        return (
            <main className="flex min-h-dvh flex-col items-center justify-center bg-background p-4">
                <div className="w-full max-w-sm space-y-4 text-center">
                    <div className="flex justify-center">
                        <Lock className="h-12 w-12 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Acesso Restrito</h1>
                    <p className="text-muted-foreground">Por favor, insira a senha para visualizar o dashboard.</p>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input
                            type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        <Button type="submit" className="w-full">Entrar</Button>
                    </form>
                </div>
            </main>
        );
    }
    
    if (isLoading || !metrics) {
        return (
             <main className="flex min-h-dvh flex-col items-center justify-center bg-background p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary"/>
                <p className="mt-4 text-muted-foreground">Carregando dados do dashboard...</p>
             </main>
        )
    }

    return (
        <main className="min-h-dvh bg-secondary/40 p-4 sm:p-6 md:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard de Feedback</h1>
                        <p className="text-muted-foreground">Análise das respostas da pesquisa de satisfação.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={handleExportCSV} disabled={!surveyResponses || surveyResponses.length === 0} variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Exportar Contatos (CSV)
                        </Button>
                        <Button onClick={handleExportPDF} disabled={!surveyResponses || surveyResponses.length === 0}>
                            <FileDown className="mr-2 h-4 w-4" />
                            Exportar Respostas (PDF)
                        </Button>
                    </div>
                </div>

                {/* Cards de Métricas */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Respostas</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.totalResponses}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avaliação Média Geral</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.avgRating.toFixed(2)} de 5</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <CustomPieChart data={metrics.comoNosConheceuData} title="Como nos conheceu?" icon={Share2} />
                    <CustomPieChart data={metrics.atendimentoData} title="Como foi o Atendimento?" icon={ThumbsUp} />
                    <CustomPieChart data={metrics.agilidadeData} title="Agilidade no Preparo" icon={Clock} />
                    <CustomPieChart data={metrics.burgerData} title="Como estava o Burger?" icon={Coffee} />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Users2 className="h-4 w-4 text-muted-foreground" />
                                Blogueiras Mencionadas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={metrics.blogueiraData} layout="vertical" margin={{ left: 20, right: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}}/>
                                    <Tooltip />
                                    <Bar dataKey="value" name="Menções" fill="#F3722C" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <BarChart2 className="h-4 w-4 text-muted-foreground" />
                                Avaliação Geral (1-5 Estrelas)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={metrics.avaliacaoGeralData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="value" name="Respostas">
                                        {metrics.avaliacaoGeralData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={RATING_COLORS[parseInt(entry.name) - 1] || '#8884d8'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Tabela de Respostas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Respostas Detalhadas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="w-full overflow-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Telefone</TableHead>
                                        <TableHead className="text-center">Avaliação</TableHead>
                                        <TableHead>Atendimento</TableHead>
                                        <TableHead>Agilidade</TableHead>
                                        <TableHead>Burger</TableHead>
                                        <TableHead>Melhoria</TableHead>
                                        <TableHead>Sugestão</TableHead>
                                        <TableHead>Prêmio</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {surveyResponses && surveyResponses.length > 0 ? (
                                        surveyResponses.map(r => (
                                            <TableRow key={r.id}>
                                                <TableCell className="font-medium whitespace-nowrap">{r.nome}</TableCell>
                                                <TableCell className="whitespace-nowrap">{r.telefone}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline">{r.avaliacaoGeral} ★</Badge>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">{r.atendimento}</TableCell>
                                                <TableCell className="whitespace-nowrap">{r.agilidade}</TableCell>
                                                <TableCell className="whitespace-nowrap">{r.burger}</TableCell>
                                                <TableCell className="min-w-[200px] max-w-xs truncate">
                                                    {r.melhoriaBurger || 'N/A'}
                                                </TableCell>
                                                <TableCell className="min-w-[200px] max-w-xs truncate">
                                                    {r.sugestao || 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {r.premioGanho ? <Badge>{r.premioGanho}</Badge> : <span className="text-muted-foreground text-xs">N/A</span>}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={9} className="h-24 text-center">
                                                Nenhuma resposta ainda.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                         </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
