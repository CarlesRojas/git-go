import * as vscode from 'vscode';
import { GitService } from './gitService';

export const enum DiffSide {
    Old,
    New
}

/**
 * Manages providing a specific revision of a repository file for use in the Visual Studio Code Diff View.
 */
export class DiffDocProvider implements vscode.TextDocumentContentProvider {
    public static scheme = 'git-go';
    private readonly gitService: GitService;
    private readonly docs = new Map<string, DiffDocument>();
    private readonly onDidChangeEventEmitter = new vscode.EventEmitter<vscode.Uri>();
    private readonly onDidCloseTextDocumentDisposable: vscode.Disposable;

    /**
     * Creates the Git Go Diff Document Provider.
     */
    constructor() {
        this.gitService = GitService.getInstance();

        // Clean up cached documents when they're closed
        this.onDidCloseTextDocumentDisposable = vscode.workspace.onDidCloseTextDocument((doc) => {
            this.docs.delete(doc.uri.toString());
        });
    }

    /**
     * An event to signal a resource has changed.
     */
    get onDidChange() {
        return this.onDidChangeEventEmitter.event;
    }

    /**
     * Provides the content of a text document at a specific Git revision.
     * @param uri The `git-go://file.ext?encoded-data` URI.
     * @returns The content of the text document.
     */
    public provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {
        const document = this.docs.get(uri.toString());
        if (document) {
            return document.value;
        }

        const request = decodeDiffDocUri(uri);
        if (!request.exists) {
            // Return empty file (used for one side of added / deleted file diff)
            return '';
        }

        return this.gitService.getCommitFile(request.commit, request.filePath).then(
            (contents) => {
                const document = new DiffDocument(contents);
                this.docs.set(uri.toString(), document);
                return document.value;
            },
            (error) => {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                vscode.window.showErrorMessage('Unable to retrieve file: ' + errorMessage);
                return '';
            }
        );
    }

    /**
     * Invalidate cached diff documents and notify VS Code so any open diff editors
     * re-fetch their content. Call this whenever git state changes in a way that
     * could affect already-rendered diffs (amend, rebase, reset, force-push, etc.).
     *
     * @param uri Optional specific URI to invalidate. If omitted, invalidates all cached documents.
     */
    public invalidate(uri?: vscode.Uri) {
        if (uri) {
            this.docs.delete(uri.toString());
            this.onDidChangeEventEmitter.fire(uri);
        } else {
            // Fire change events for every cached doc, then drop them all
            for (const key of this.docs.keys()) {
                this.onDidChangeEventEmitter.fire(vscode.Uri.parse(key));
            }
            this.docs.clear();
        }
    }

    /**
     * Dispose of resources used by the provider.
     */
    public dispose() {
        this.docs.clear();
        this.onDidChangeEventEmitter.dispose();
        this.onDidCloseTextDocumentDisposable.dispose();
    }
}

/**
 * Represents the content of a Diff Document.
 */
class DiffDocument {
    private readonly body: string;

    /**
     * Creates a Diff Document with the specified content.
     * @param body The content of the document.
     */
    constructor(body: string) {
        this.body = body;
    }

    /**
     * Get the content of the Diff Document.
     */
    get value() {
        return this.body;
    }
}

/* Encoding and decoding URI's */

/**
 * Represents the data passed through `git-go://file.ext?encoded-data` URI's by the DiffDocProvider.
 */
type DiffDocUriData = {
    filePath: string;
    commit: string;
    exists: boolean;
};

/**
 * Produce the URI of a file to be used in the Visual Studio Diff View.
 * @param filePath The path of the file.
 * @param commit The commit hash specifying the revision of the file.
 * @param fileExists Whether the file exists at this revision.
 * @returns A URI of the form `git-go://file.ext?encoded-data`
 */
export function encodeDiffDocUri(filePath: string, commit: string, fileExists: boolean): vscode.Uri {
    const data: DiffDocUriData = {
        filePath: filePath,
        commit: commit,
        exists: fileExists
    };

    let extension: string;
    if (!fileExists) {
        extension = '';
    } else {
        const extIndex = filePath.indexOf('.', filePath.lastIndexOf('/') + 1);
        extension = extIndex > -1 ? filePath.substring(extIndex) : '';
    }

    return vscode.Uri.file('file' + extension).with({
        scheme: DiffDocProvider.scheme,
        query: Buffer.from(JSON.stringify(data)).toString('base64')
    });
}

/**
 * Decode the data from a `git-go://file.ext?encoded-data` URI.
 * @param uri The URI to decode data from.
 * @returns The decoded DiffDocUriData.
 */
export function decodeDiffDocUri(uri: vscode.Uri): DiffDocUriData {
    return JSON.parse(Buffer.from(uri.query, 'base64').toString());
}
