import { BaseTableSegment } from "@/lib/types/types"
//TODO refactor typesafety
export function getTotalSortExpression(column: string | undefined, order: "asc" | "desc" | undefined): string {
  if (column) {
    switch (column) {
      case "city":
        return order === "asc" ? "segment.city" : "-segment.city"
      case "name":
        return order === "asc" ? "segment.name" : "-segment.name"
      case "terrain":
        return order === "asc" ? "segment.average_grade" : "-segment.average_grade"
      default:
        return order === "asc" ? "created" : "-created"
    }
  } else {
    return order === "asc" ? "created" : "-created"
  }
}
