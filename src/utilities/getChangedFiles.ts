import * as vscode from "vscode";
import * as simpleGit from "simple-git";
import { generateCommitPromptForFileChange } from "./commitPromptGeneration";
const LLM_ENDPOINT = process.env.LLM_ENDPOINT;
console.log({ LLM_ENDPOINT });

export async function getChangedFiles() {
  // Check if there is an open workspace
  if (!vscode.workspace.workspaceFolders) {
    vscode.window.showErrorMessage("No workspace folder is open.");
    return [];
  }
  // Use the first workspace folder path
  const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;

  // Initialize simple-git with the workspace path
  const git = simpleGit.default(workspacePath);

  try {
    // getting the stats of the current working directory
    const status = await git.status();

    // gettting files which are modified
    const changedFiles = status.modified;

    if (changedFiles) return changedFiles;
    else return [];
  } catch (error) {
    // console.error("Error fetching changed files:", error);
    vscode.window.showErrorMessage(
      "Error occured while fetching changed files from git"
    );
    return [];
  }
}

export const generateCommitMessageForChangedFiles = async (
  changedFiles: any[]
) => {
  //   const changedFiles = await getChangedFiles();
  try {
    // combination of all the git messages
    let combinedCommitMessages = "";

    // Check if there is an open workspace
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showErrorMessage("No workspace folder is open.");
      return;
    }

    // Use the first workspace folder path
    const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;

    // Initialize simple-git with the workspace path
    const git = simpleGit.default(workspacePath);

    // Get diffs for each modified file
    for (const file of changedFiles) {
      console.log({ file });
      const diff = await git.diff([file]);
      const requestMessage = generateCommitPromptForFileChange(diff, file);

      const requestBody = {
        model: "llama3.2",
        prompt: requestMessage,
        stream: false,
      };

      try {
        const res = await fetch(LLM_ENDPOINT as string, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(100000),
        });
        const response: any = await res.json();
        combinedCommitMessages += `${file}\n`;
        combinedCommitMessages += response.response;
        combinedCommitMessages += `\n\n`;
        console.log({ response: response.response });
      } catch {
        vscode.window.showErrorMessage(
          "Error occured while generating commit messages, ensure the local llm is running, at it's endpoint is correct"
        );
      }
    }
    return combinedCommitMessages;
  } catch (error) {
    vscode.window.showErrorMessage(
      "Error occured while generating commit messages, ensure the local llm is running, at it's endpoint is correct"
    );
  }
};

export const showCommitMessagesInUntitledFiles = async (
  commitMessage: string
) => {
  try {
    // Create an untitled, unsaved text document with the commit message content
    const document = await vscode.workspace.openTextDocument({
      content: commitMessage,
      language: "plaintext", // Specify language as needed (e.g., markdown)
    });

    // Show the document in a new editor tab
    await vscode.window.showTextDocument(document);

    vscode.window.showInformationMessage(
      "Successfully created commit messages!"
    );
  } catch (erro) {
    vscode.window.showErrorMessage(
      "Error occured while showing commit message in new file"
    );
  }
};

export const completeCommitMessageGenerationUtility = async () => {
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Generating commit message...",
      cancellable: false,
    },

    async (progress) => {
      try {
        const changedFiles = await getChangedFiles();
        const combinedCommitMessage =
          await generateCommitMessageForChangedFiles(changedFiles);

        //   if commit message is generated show in new unsaved txt file
        if (combinedCommitMessage) {
          showCommitMessagesInUntitledFiles(combinedCommitMessage);
        }
      } catch {}
    }
  );
};
