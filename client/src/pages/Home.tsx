import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Calendar, Users, History, MapPin } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import MembersPage from "./Members";
import CalendarPage from "./Calendar";
import HistoryPage from "./History";

type Page = "dashboard" | "members" | "calendar" | "history";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  const { data: currentTracking } = trpc.chapel.tracking.current.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: members } = trpc.chapel.members.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin w-8 h-8 text-accent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto bg-accent rounded-2xl flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-accent-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Capela Itinerante</h1>
            <p className="text-muted-foreground text-lg">
              Gerencie a rotação da sua capela com elegância e precisão
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-2">Funcionalidades</h3>
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li>✓ Cadastro e gerenciamento de membros</li>
                <li>✓ Rastreamento em tempo real</li>
                <li>✓ Calendário automático de rotação</li>
                <li>✓ Histórico completo de passagens</li>
              </ul>
            </div>
          </div>

          <a href={getLoginUrl()}>
            <Button size="lg" className="w-full bg-accent hover:bg-accent/90">
              Entrar com Manus
            </Button>
          </a>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case "members":
        return <MembersPage />;
      case "calendar":
        return <CalendarPage />;
      case "history":
        return <HistoryPage />;
      default:
        return <DashboardContent currentTracking={currentTracking} members={members} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Capela Itinerante</h1>
              <p className="text-xs text-muted-foreground">Controle de Rotação</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="border-b border-border bg-card">
        <div className="container flex gap-2 overflow-x-auto">
          <button
            onClick={() => setCurrentPage("dashboard")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              currentPage === "dashboard"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Dashboard
            </div>
          </button>
          <button
            onClick={() => setCurrentPage("members")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              currentPage === "members"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Membros
            </div>
          </button>
          <button
            onClick={() => setCurrentPage("calendar")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              currentPage === "calendar"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Calendário
            </div>
          </button>
          <button
            onClick={() => setCurrentPage("history")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              currentPage === "history"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Histórico
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container py-8">
        {renderPage()}
      </main>
    </div>
  );
}

function DashboardContent({ currentTracking, members }: any) {
  const memberCount = members?.length || 0;

  return (
    <div className="space-y-8">
      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-accent/20 bg-gradient-to-br from-card to-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" />
              Localização Atual
            </CardTitle>
            <CardDescription>Onde está a capela agora</CardDescription>
          </CardHeader>
          <CardContent>
            {currentTracking ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Responsável</p>
                  <p className="text-2xl font-bold text-foreground">{currentTracking.member?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Desde</p>
                  <p className="text-sm text-foreground">
                    {new Date(currentTracking.startDate).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                {currentTracking.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Observações</p>
                    <p className="text-sm text-foreground">{currentTracking.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhuma localização registrada ainda</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Estatísticas
            </CardTitle>
            <CardDescription>Informações gerais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Total de Membros</span>
                <span className="text-2xl font-bold text-foreground">{memberCount}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Próximo Responsável</span>
                <span className="text-sm font-medium text-accent">
                  {members && members.length > 0 ? members[1]?.name || "—" : "—"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Gerencie a rotação da capela</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button className="gap-2 bg-accent hover:bg-accent/90">
            <Plus className="w-4 h-4" />
            Adicionar Membro
          </Button>
          <Button variant="outline" className="gap-2">
            <MapPin className="w-4 h-4" />
            Atualizar Localização
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
