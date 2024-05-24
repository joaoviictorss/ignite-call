import { Button, Heading, MultiStep, Text, TextInput } from "@ignite-ui/react";
import { Container, Form, FormError, Header } from "./styles";
import { ArrowRight } from "phosphor-react";
import {
  Input,
  Prefix,
  TextInputContainer,
} from "../home/componentes/ClaimUsernameForm/styles";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { api } from "@/src/lib/axios";
import { AxiosError } from "axios";

const registerFormSchema = z.object({
  username: z
    .string()
    .min(3, "O usuario deve ter no minimo 3 letras")
    .regex(/^([a-z\\\\-]+)$/i, "O usuário pode ter apenas letras.")
    .transform((username) => username.toLowerCase()),
  name: z.string().min(3, "O nome precisa ter pelo menos 3 letras."),
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

export default function Register() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
  });

  const router = useRouter();

  useEffect(() => {
    if (router.query.username) {
      setValue("username", String(router.query.username));
    }
  }, [router.query?.username, setValue]);

  async function handleRegister(data: RegisterFormData) {
    try {
      await api.post("/users", {
        name: data.name,
        username: data.username,
      });
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data.message) {
        alert(error.response.data.message);
        return
      }

      console.error(error)
    }
  }

  return (
    <Container>
      <Header>
        <Heading as="strong">Bem-vindo ao Ignite Call!</Heading>
        <Text>
          Precisamos de algumas informações para criar seu perfil! Ah, você pode
          editar essas informações depois.
        </Text>

        <MultiStep size={4} currentStep={1} />
      </Header>
      <Form as="form" onSubmit={handleSubmit(handleRegister)}>
        <label>
          <Text size="sm">Nome de usuário</Text>
          <TextInputContainer>
            <Prefix>ignite.com/</Prefix>
            <Input placeholder="seu-usuario" {...register("username")} />
          </TextInputContainer>

          {errors.username && (
            <FormError size="sm">{errors.username?.message}</FormError>
          )}
        </label>
        <label>
          <Text size="sm">Nome completo</Text>
          <TextInputContainer>
            <Input placeholder="Seu nome" {...register("name")} />
          </TextInputContainer>

          {errors.name && (
            <FormError size="sm">{errors.name?.message}</FormError>
          )}
        </label>

        <Button>
          Próximo passo
          <ArrowRight />
        </Button>
      </Form>
    </Container>
  );
}
