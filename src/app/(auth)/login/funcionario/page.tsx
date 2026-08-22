import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LoginFuncionarioForm } from "@/components/site/login-funcionario-form";

export default function LoginFuncionarioPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Portal do Funcionário</CardTitle>
        <CardDescription>Entre com seu CPF e a senha cadastrada pelo RH.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginFuncionarioForm />
      </CardContent>
    </Card>
  );
}
