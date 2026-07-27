export function readString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

export function readStrings(formData: FormData, name: string): string[] {
  return formData.getAll(name).filter((entry): entry is string => typeof entry === 'string');
}

export function readFile(formData: FormData, name: string): File | null {
  const value = formData.get(name);
  return value instanceof File ? value : null;
}
