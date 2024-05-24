import { Button, Text } from "@ignite-ui/react";
import {
  Form,
  FormAnnotation,
  Input,
  Prefix,
  TextInputContainer,
} from "./styles";
import { ArrowRight } from "phosphor-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";

const claimUsernameFormSchema = z.object({
  username: z
    .string()
    .min(3, "O usuario deve ter no minimo 3 letras")
    .regex(/^([a-z\\\\-]+)$/i, "O usuário pode ter apenas letras.")
    .transform((username) => username.toLowerCase()),
});

type ClaimUsernameFormData = z.infer<typeof claimUsernameFormSchema>;
export function ClaimUsernameForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting},
  } = useForm<ClaimUsernameFormData>({
    resolver: zodResolver(claimUsernameFormSchema),
  });

  const router = useRouter()

  async function handlePreRegister(data: ClaimUsernameFormData) {
    const {username} = data

    await router.push(`/register?username=${username}`)
  }

  return (
    <>
      <Form as="form" onSubmit={handleSubmit(handlePreRegister)}>
        <TextInputContainer>
          <Prefix>ignite.com/</Prefix>
          <Input {...register("username")} placeholder="seu-usuario" />
        </TextInputContainer>
        <Button size="sm" type="submit" disabled={isSubmitting}>
          Reservar
          <ArrowRight />
        </Button>
      </Form>
      <FormAnnotation>
        <Text size="sm">
          {errors.username
            ? errors.username.message
            : "Digite o nome do usuário desejado"}
        </Text>
      </FormAnnotation>
    </>
  );
}
