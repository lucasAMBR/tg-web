import { Controller, useForm } from "react-hook-form";
import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export default function PasswordChange(){

    const form = useForm();

    return(
        <form className="flex flex-col gap-3">
            <Controller 
                control={form.control}
                name="old_password"
                render={({ field, fieldState }) => (
                    <Field>
                        <FieldLabel>Actual password</FieldLabel>
                        <Input
                            value={field.value}
                            onChange={field.onChange} 
                            placeholder="Old password" 
                        />
                    </Field>
                )}
            />
            <Controller 
                control={form.control}
                name="new_password"
                render={({ field, fieldState }) => (
                    <Field>
                        <FieldLabel>New password</FieldLabel>
                        <Input
                            value={field.value}
                            onChange={field.onChange} 
                            placeholder="New password" 
                        />
                    </Field>
                )}
            />
            <Controller 
                control={form.control}
                name="new_password"
                render={({ field, fieldState }) => (
                    <Field>
                        <FieldLabel>New password confirmation</FieldLabel>
                        <Input
                            value={field.value}
                            onChange={field.onChange} 
                            placeholder="New password confirmation" 
                        />
                    </Field>
                )}
            />
            <Button disabled={!form.formState.isDirty}>Change</Button>
        </form>
    );
}