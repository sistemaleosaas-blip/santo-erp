import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LoginEmailForm } from "@/components/site/login-email-form";

export default function LoginClientePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Portal do Cliente</CardTitle>
        <CardDescription>Entre com o e-mail cadastrado no seu contrato.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginEmailForm defaultRedirect="/cliente/dashboard" />
      </CardContent>
    </Card>
  );
}
