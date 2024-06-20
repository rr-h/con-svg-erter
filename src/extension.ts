import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.convertImage', async (uri: vscode.Uri) => {
    if (!uri || !uri.fsPath) {
      vscode.window.showErrorMessage('No image file selected.');
      return;
    }

    const inputFile = uri.fsPath;

    try {
      const scriptPath = vscode.Uri.file('/home/rr-h/Documents/Scripts/image_to_svg.sh').fsPath;
      const { stdout, stderr } = await execAsync(`bash "${scriptPath}" "${inputFile}"`);
      if (stderr) {
        throw new Error(stderr);
      }

      vscode.window.showInformationMessage(`Conversion complete: ${stdout.trim()}`);
    } catch (error) {
      if (error instanceof Error) {
        vscode.window.showErrorMessage(`Conversion failed: ${error.message}`);
      } else {
        vscode.window.showErrorMessage('Conversion failed: An unknown error occurred.');
      }
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
