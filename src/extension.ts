// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import * as nodemailer from 'nodemailer';



// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const channel = vscode.window.createOutputChannel('Terminal Mail');
	
	let config = vscode.workspace.getConfiguration('terminal-mail');
	const secretStorage: vscode.SecretStorage = context.secrets;

	// function send mail
	async function sendMail(text: string) {
		let pass: string| undefined = config.get('nodemailer_pass');
		if (pass==="") {
            const password = await vscode.window.showInputBox({
                prompt: 'Please enter password for email address',
                password: true // 设置为密码框
            });
			if (password) {
                // 将用户输入的密码保存在SecretStorage中
                await secretStorage.store('nodemailer_pass_token', password);
            }
		
			pass = await secretStorage.get('nodemailer_pass_token');
		}
		// Create a transporter object
		let transporter = nodemailer.createTransport({
			host: config.get('nodemailer_host'),
			port: config.get('nodemailer_port'),
			secure: config.get('nodemailer_secure'),
			auth: {
				user: config.get('nodemailer_user'),
				pass: pass,
			},
			tls: {
				ciphers: config.get('nodemailer_tls_ciphers')
			}
		});

		// Send a test email using the transporter object
		transporter.sendMail({
			from: config.get('nodemailer_from'),
			to: config.get('nodemailer_to'),
			subject: config.get('nodemailer_subject'),
			text: text
		}, (err, info) => {
			if (err) {
				// Show an error message if the email failed to send
				console.error('Failed to send email: ' + err.message);
				vscode.window.showInformationMessage('Failed to send email: ' + err.message);
			} else {
				// Show a success message if the email was sent successfully
				console.log('Email sent successfully: ' + info.response);
				vscode.window.showInformationMessage('Email sent successfully: ' + info.response);
			}
		});
}


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
				terminal?.processId.then((processId) => {
					//Copy from terminal by executing commands
					// Execute the select all command
					vscode.commands.executeCommand('workbench.action.terminal.selectAll');
					// Execute the copy selection command
					vscode.commands.executeCommand('workbench.action.terminal.copySelection');
					// Get the clipboard content
					vscode.env.clipboard.readText().then(text => {
						// Print the text to the console
						sendMail(text);

						// show message in output channel
						channel.appendLine(text || 'No terminal found!');

						vscode.window.showInformationMessage(`Send terminal ${terminalName} : ${processId}` || 'No terminal found!');
					});
				});
			}
		});


		// Display a message box to the user
		vscode.window.showInformationMessage('Send email from Terminal Mail!');
	});

	context.subscriptions.push(disposable);


	let disposable_pass = vscode.commands.registerCommand('terminal-mail.nodemailer_setPassword', async () => {
		const passwordInput: string = await vscode.window.showInputBox({
		  password: true, 
		  title: "Password"
		}) ?? '';
		
		secretStorage.store("server_password", passwordInput);
	  });

	context.subscriptions.push(disposable_pass);
}

// This method is called when your extension is deactivated
export function deactivate() { }
