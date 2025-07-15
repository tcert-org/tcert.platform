import { NextRequest } from "next/server";
import OptionMiddleware from "@/modules/exam/question/elections/middleware";
import OptionsController from "@/modules/exam/question/elections/controller";

export async function POST(req: NextRequest) {
  return OptionMiddleware.validateOption(req, OptionsController.createOptions);
}
