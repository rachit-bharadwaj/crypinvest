import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDateAndDay(): string {
  const now = new Date();

  const day = now.getDate().toString().padStart(2, "0");
  const month = now.toLocaleString("en-GB", { month: "long" });
  const year = now.getFullYear();
  const weekday = now.toLocaleString("en-GB", { weekday: "long" });

  return `${day} ${month} ${year}, ${weekday}`;
}

type NumberingSystem = "indian" | "roman";

/**
 * Formats a number with commas based on the specified numbering system.
 * @param {number | string} value - The number to format.
 * @param {NumberingSystem} [system="roman"] - The numbering system: "indian" or "roman".
 * @returns {string} - The formatted number with commas.
 */
export function addCommasToNumber(
  value: number | string,
  system: NumberingSystem = "roman"
): string {
  const [wholePart, decimalPart] = value.toString().split(".");

  if (system === "indian") {
    // Indian numbering system formatting
    const lastThree = wholePart.slice(-3);
    const otherNumbers = wholePart.slice(0, -3);
    const formattedWholePart =
      otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") +
      (otherNumbers ? "," : "") +
      lastThree;
    return decimalPart
      ? `${formattedWholePart}.${decimalPart}`
      : formattedWholePart;
  } else {
    // Roman (International) numbering system formatting
    return (
      wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
      (decimalPart ? `.${decimalPart}` : "")
    );
  }
}
