"use client";

import * as React from "react";
import {
	Controller,
	type Control,
	type FieldValues,
	type Path,
} from "react-hook-form";
import { ImagePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";

type Props<T extends FieldValues> = {
	control: Control<T>;
	name: Path<T>;
	label?: string;
	maxFiles?: number;
};

export function ImageUploadField<T extends FieldValues>({
	control,
	name,
	label,
	maxFiles = 6,
}: Props<T>) {
	const inputRef = React.useRef<HTMLInputElement | null>(null);

	return (
		<Controller
			control={control}
			name={name}
			render={({ field, fieldState }) => {
				const files: File[] = field.value || [];

				const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
					const newFiles = Array.from(e.target.files || []);
					const updated = [...files, ...newFiles].slice(0, maxFiles);
					field.onChange(updated);
					e.target.value = "";
				};

				const handleRemove = (index: number) => {
					const updated = files.filter((_, i) => i !== index);
					field.onChange(updated);
				};

				return (
					<Field>
						{label && <FieldLabel>{label}</FieldLabel>}

						<input
							ref={inputRef}
							type="file"
							accept="image/*"
							multiple
							className="hidden"
							onChange={handleAddFiles}
						/>

						<div className="grid grid-cols-6 gap-2">
							{files.map((file, index) => (
								<div
									key={index}
									className="group relative cursor-pointer aspect-square"
								>
									<img
										src={URL.createObjectURL(file)}
										alt={file.name}
										className="h-full w-full rounded-lg object-cover"
									/>

									<Button
										type="button"
										variant="secondary"
										size="icon"
										className="absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100 group-hover:text-primary"
										onClick={() => handleRemove(index)}
									>
										<X className="size-3" />
									</Button>
								</div>
							))}

							{files.length < maxFiles && (
								<button
									type="button"
									onClick={() => inputRef.current?.click()}
									className="flex aspect-square flex-col items-center cursor-pointer justify-center gap-1 rounded-lg border-2 border-dashed hover:border-primary hover:text-primary hover:bg-primary/5"
								>
									<ImagePlus className="size-6 text-muted-foreground" />
									<span className="text-xs text-muted-foreground">Add</span>
								</button>
							)}
						</div>

						<p className="mt-2 text-center text-xs text-muted-foreground">
							{files.length}/{maxFiles} images
						</p>

						{fieldState.error && (
							<span className="text-destructive text-sm">
								{fieldState.error.message}
							</span>
						)}
					</Field>
				);
			}}
		/>
	);
}
