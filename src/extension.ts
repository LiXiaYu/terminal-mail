// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import * as nodemailer from 'nodemailer';


// function send mail
function sendMail(text: string) {
	// Create a transporter object
	let transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: '',
			pass: ''
		}
	});

	// Send a test email using the transporter object
	transporter.sendMail({
		from: '',
		to: '',
		subject: 'email from vscode terminal mail extension',
		text: text
	}, (err, info) => {
		if (err) {
			// Show an error message if the email failed to send
			console.error('Failed to send email: ' + err.message);
		} else {
			// Show a success message if the email was sent successfully
			console.log('Email sent successfully: ' + info.response);
		}
	});
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "terminal-mail" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('terminal-mail.sendTerminalOutput', () => {
		// The code you place here will be executed every time your command is executed
		vscode.window.showQuickPick(vscode.window.terminals.map(t => t.name)).then(terminalName => {
			if (terminalName) {
				// Find the terminal object by name
				let terminal = vscode.window.terminals.find(t => t.name === terminalName);
				terminal?.show();	


				//Copy from terminal by executing commands
				// Execute the select all command
				vscode.commands.executeCommand('workbench.action.terminal.selectAll');
				// Execute the copy selection command
				vscode.commands.executeCommand('workbench.action.terminal.copySelection');
				// Get the clipboard content
				vscode.env.clipboard.readText().then(text => {
					// Print the text to the console
					console.log(text);
					// sendMail(text);
					vscode.window.showInformationMessage(text || 'No terminal found!');

				});

			}
		});


		// Display a message box to the user
		vscode.window.showInformationMessage('Send email from Terminal Mail!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
