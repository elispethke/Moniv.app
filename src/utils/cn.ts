type ClassValue = string | number | undefined | null | false | ClassValue[]

export function cn(...inputs: ClassValue[]): string {
  return inputs
    .flat(Infinity as 10)
    .filter(Boolean)
    .join(' ')
}
