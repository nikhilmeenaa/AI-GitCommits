import * as vscode from "vscode";
import dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.join(__dirname, "..", ".env") });
import { completeCommitMessageGenerationUtility } from "./utilities/getChangedFiles";

// Load environment variables from .env file

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "commitai" is now active!');

  const disposable = vscode.commands.registerCommand(
    "commitai.helloWorld",
    async () => {
      await completeCommitMessageGenerationUtility();
      // console.log("Hello World!");
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
