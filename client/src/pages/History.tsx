import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History as HistoryIcon, Calendar, User } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function HistoryPage() {
  const { data: history, isLoading } = trpc.chapel.history.list.useQuery({ limit: 50 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin w-6 h-6 text-accent" />
      </div>
    );
  }

  const calculateDays = (startDate: Date | string, endDate?: Date | string | null) => {
    const end = endDate ? new Date(endDate) : new Date();
    const start = new Date(startDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Histórico de Passagem</h2>
        <p className="text-muted-foreground mt-1">Registro completo de todas as rotações da capela</p>
      </div>

      {history && history.length > 0 ? (
        <div className="space-y-3">
          {history.map((record, index) => {
            const daysHeld = calculateDays(record.startDate, record.endDate);
            const isCurrentlyHeld = !record.endDate;

            return (
              <Card
                key={record.id}
                className={`border-l-4 transition-all ${
                  isCurrentlyHeld ? "border-l-accent bg-accent/5" : "border-l-muted"
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Membro #{record.memberId}</p>
                          {isCurrentlyHeld && (
                            <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded inline-block mt-1">
                              Atualmente com a capela
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 ml-12">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Início</p>
                          <p className="text-sm text-foreground">
                            {new Date(record.startDate).toLocaleDateString("pt-BR", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>

                        {record.endDate && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Término</p>
                            <p className="text-sm text-foreground">
                              {new Date(record.endDate).toLocaleDateString("pt-BR", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        )}

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Duração</p>
                          <p className="text-sm font-medium text-accent">
                            {daysHeld} dia{daysHeld !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      {record.notes && (
                        <div className="mt-4 ml-12 p-3 bg-muted/50 rounded border border-border">
                          <p className="text-xs text-muted-foreground mb-1">Observações</p>
                          <p className="text-sm text-foreground">{record.notes}</p>
                        </div>
                      )}
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
            <HistoryIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              Nenhum histórico registrado ainda. Comece a rotação da capela!
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sobre o Histórico</CardTitle>
          <CardDescription>
            Informações úteis sobre o registro de passagem
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            • Cada registro mostra quando a capela chegou e saiu de cada membro
          </p>
          <p>
            • A duração é calculada automaticamente em dias
          </p>
          <p>
            • Registros sem data de término indicam que a capela ainda está com esse membro
          </p>
          <p>
            • Você pode adicionar observações em cada passagem
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
