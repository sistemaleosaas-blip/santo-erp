import { Suspense } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LoginEmailForm } from "@/components/site/login-email-form";

export default function LoginAdminPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Área Administrativa</CardTitle>
        <CardDescription>Acesso restrito à equipe Santo (Master, Admin, RH e Supervisão).</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={null}>
          <LoginEmailForm defaultRedirect="/admin/dashboard" />
        </Suspense>
      </CardContent>
    </Card>
  );
}
