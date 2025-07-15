"use client";
import { DataTable } from "@/components/data-table/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { FetchParams } from "@/lib/types";

export interface DetailExam {
  id: string;
  question_name: string;
}
function detailsExam() {
  return <div>detailsExam</div>;
}

export default detailsExam;
