import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, GripVertical, Mail, Phone } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function MembersPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  const { data: members, refetch } = trpc.chapel.members.list.useQuery();
  const createMutation = trpc.chapel.members.create.useMutation();
  const deleteMutation = trpc.chapel.members.delete.useMutation();

  const handleAddMember = async () => {
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
      });
      setFormData({ name: "", email: "", phone: "" });
      setIsOpen(false);
      refetch();
      toast.success("Membro adicionado com sucesso!");
    } catch (error) {
      toast.error("Erro ao adicionar membro");
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm("Tem certeza que deseja remover este membro?")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      refetch();
      toast.success("Membro removido com sucesso!");
    } catch (error) {
      toast.error("Erro ao remover membro");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Membros da Rotação</h2>
          <p className="text-muted-foreground mt-1">Gerencie a lista de membros e sua ordem</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-accent hover:bg-accent/90">
              <Plus className="w-4 h-4" />
              Novo Membro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Membro</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo membro da rotação
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Nome *</label>
                <Input
                  placeholder="Nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Telefone</label>
                <Input
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleAddMember}
                disabled={createMutation.isPending}
                className="w-full bg-accent hover:bg-accent/90"
              >
                {createMutation.isPending ? "Adicionando..." : "Adicionar Membro"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Membros</CardTitle>
          <CardDescription>
            {members?.length || 0} membro{members?.length !== 1 ? "s" : ""} cadastrado{members?.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members && members.length > 0 ? (
            <div className="space-y-2">
              {members.map((member, index) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2 text-muted-foreground min-w-fit">
                    <GripVertical className="w-4 h-4" />
                    <span className="font-semibold text-sm bg-accent/10 text-accent px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{member.name}</p>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      {member.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {member.email}
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {member.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMember(member.id)}
                    disabled={deleteMutation.isPending}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Nenhum membro cadastrado ainda</p>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-accent hover:bg-accent/90">
                    <Plus className="w-4 h-4" />
                    Adicionar Primeiro Membro
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            • A ordem dos membros define a sequência de rotação da capela
          </p>
          <p>
            • Você pode reordenar os membros arrastando-os (em breve)
          </p>
          <p>
            • Remova um membro clicando no ícone de lixeira
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
