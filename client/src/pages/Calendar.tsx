import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function CalendarPage() {
  const { data: calendar, isLoading } = trpc.chapel.calendar.generate.useQuery({ days: 30 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin w-6 h-6 text-accent" />
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Calendário de Rotação</h2>
        <p className="text-muted-foreground mt-1">Próximos 30 dias da rotação da capela</p>
      </div>

      {calendar && calendar.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {calendar.map((day, index) => {
            const isToday = new Date(day.date).getTime() === today.getTime();
            const isFuture = new Date(day.date) > today;

            return (
              <Card
                key={index}
                className={`border-2 transition-all ${
                  isToday
                    ? "border-accent bg-accent/5"
                    : isFuture
                      ? "border-border hover:border-accent/50"
                      : "border-border opacity-60"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {day.dayOfWeek}
                      </p>
                      <p className="text-sm text-foreground mt-1">
                        {new Date(day.date).toLocaleDateString("pt-BR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    {isToday && (
                      <span className="bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded">
                        Hoje
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Responsável</p>
                      <p className="font-semibold text-foreground text-sm">{day.member.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Nenhum membro cadastrado. Adicione membros para gerar o calendário.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Legenda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent rounded"></div>
            <span className="text-foreground">Hoje - Responsável atual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-border rounded"></div>
            <span className="text-foreground">Próximos dias</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
