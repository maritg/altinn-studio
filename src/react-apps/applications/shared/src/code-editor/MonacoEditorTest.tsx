import { css, StyleSheet } from 'aphrodite';
import classnames from 'classnames';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.main';
//import { SimpleEditorModelResolverService } from 'monaco-editor/esm/vs/editor/standalone/browser/simpleServices';
import { StaticServices } from 'monaco-editor/esm/vs/editor/standalone/browser/standaloneServices';
import * as React from 'react';
import getFileLanguage from '../utils/getFileLanguage';
//import getRelativePath from '../utils/getRelativePath';
// import * as debounce from 'lodash/debounce';

//@ts-ignore
global.MonacoEnvironment = {
  getWorker(_: string, label: string) {
    switch(label) {
      case 'json':
        // @ts-ignore
        return new Worker('monaco-editor/esm/vs/language/json/json.worker', {
          type: 'module',
        });
      case 'typescript':
      case 'javascript':
        // @ts-ignore
        return new Worker('monaco-editor/esm/vs/language/typescript/ts.worker', {
          type: 'module',
        });
      default:
        // @ts-ignore
        return new Worker('monaco-editor/esm/vs/editor/editor.worker', {
          type: 'module',
        });
    }
  },
};

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);

export interface IMonacoEditorProps {
  path: string;
  value: string;
  onOpenPath: (path: string) => void;
  onValueChange: (value: string) => void;
  lineNumbers?: 'on' | 'off' | 'relative' | 'interval';
  wordWrap: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  scrollBeyondLastLine?: boolean;
  minimap?: {
    enabled?: boolean;
    maxColumn?: number;
    renderCharacters?: boolean;
    showSlider?: 'always' | 'mouseover';
    side?: 'right' | 'left';
  };
  autoFocus?: boolean;
  fontFamily?: string;
  fontLigatures?: boolean;
}

// Store editor states such as cursor position, selection and scroll position for each model
const editorStates = new Map<string, monaco.editor.ICodeEditorViewState | undefined | null>();

// Store details about typings we have requested and loaded
//const requestedTypings = new Map<string, string>();
const extraLibs = new Map<string, { js: monaco.IDisposable; ts: monaco.IDisposable }>();

const codeEditorService = StaticServices.codeEditorService.get();

const findModel = (path: string) => {
  return monaco.editor.getModels().find(model => model.uri.path === `/${path}`);
}

class MonacoEditor extends React.Component<IMonacoEditorProps> {
  static defaultProps: Partial<IMonacoEditorProps> = {
    lineNumbers: 'on',
    wordWrap: 'on',
    scrollBeyondLastLine: false,
    minimap: {
      enabled: false,
    },
    fontFamily: 'var(--font-monospace)',
    fontLigatures: true,
  };

  static removePath(path: string) {
    // Remove editor states
    editorStates.delete(path);

    // Remove associated models
    const model = findModel(path);

    model && model.dispose();
  }

  static renamePath(oldPath: string, newPath: string) {
    const selection = editorStates.get(oldPath);

    editorStates.delete(oldPath);
    editorStates.set(newPath, selection);

    this.removePath(oldPath);
  }

  componentDidMount() {
    // Spawn a worker to fetch type definitions for dependencies
    // @ts-ignore
    this._typingsWorker = new Worker('../../workers/typings.worker');
    this._typingsWorker && this._typingsWorker.addEventListener('message', ({ data }: any) => this._addTypings(data));

    const { path, value, autoFocus, ...rest } = this.props;

    // The methods provided by the service are on it's prototype
    // So spreading this object doesn't work, we must mutate it
    codeEditorService.openCodeEditor = async (
      { resource, options }: any,
      editor: monaco.editor.IStandaloneCodeEditor,
    ) => {
      // Remove the leading slash added by the Uri
      await this.props.onOpenPath(resource.path.replace(/^\//, ''));

      editor.setSelection(options.selection);
      editor.revealLine(options.selection.startLineNumber);

      return {
        getControl: () => editor,
      };
    };

    const editor = monaco.editor.create(this._node, rest, codeEditorService);

    this._subscription = editor.onDidChangeModelContent(() => {
      const model = editor.getModel();

      if (model) {
        const value = model.getValue();

        if (value !== this.props.value) {
          this.props.onValueChange(value);
        }
      }
    });

    this._editor = editor;
    // this._toggleMode(this.props.mode);

    this._openFile(path, value, autoFocus);
    // this._updateMarkers(annotations);
    // this._fetchTypings(this.props.dependencies, this.props.sdkVersion);

    // Load all the files so the editor can provide proper intellisense
    // this.props.entries.forEach(({ item }) => {
    //   if (
    //     item.type === 'file' &&
    //     item.path !== path &&
    //     !item.asset &&
    //     typeof item.content === 'string'
    //   ) {
    //     this._initializeFile(item.path, item.content);
    //   }
    // });

    // Hover provider to show version for imported modules
    const hoverProvider: monaco.languages.HoverProvider = {
      provideHover: (model: monaco.editor.ITextModel, position: monaco.Position): any => {
        // Get the current line
        //const line = model.getLineContent(position.lineNumber);
        const language = getFileLanguage(this.props.path);

        if (!language) {
          return;
        }

        // Tokenize the line
        // const tokens = monaco.editor.tokenize(line, language)[0];

        // for (let i = 0, l = tokens.length; i < l; i++) {
        //   const current = tokens[i];
        //   const next = tokens[i + 1];
        //   const end = next ? next.offset : line.length;

        //   if (
        //     (current.type === 'string.js' || current.type === 'string.ts') &&
        //     position.column > current.offset &&
        //     position.column < end
        //   ) {
        //     // Get the string for the token and strip quotes
        //     const string = line.slice(current.offset + 1, end - 1);

        //     const deps = this._getAllDependencies(this.props.dependencies, this.props.sdkVersion);

        //     if (deps[string]) {
        //       // If the string refers to a dependency show the version
        //       return {
        //         range: new monaco.Range(
        //           position.lineNumber,
        //           current.offset + 1,
        //           position.lineNumber,
        //           end
        //         ),
        //         contents: [{ value: `version "${deps[string].version}"` }],
        //       };
        //     }
        //   }
        // }
      },
    };

    // Completion provider to provide autocomplete for files and dependencies
    const completionProvider: monaco.languages.CompletionItemProvider = {
      triggerCharacters: ["'", '"', '.', '/'],
      provideCompletionItems: (model: monaco.editor.ITextModel, position: monaco.Position): any => {
        // Get editor content before the pointer
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        if (/(([\s|\n]+from\s+)|(\brequire\b\s*\())["|'][^'^"]*$/.test(textUntilPosition)) {
          // It's probably a `import` statement or `require` call
          // if (textUntilPosition.endsWith('.') || textUntilPosition.endsWith('/')) {
            // User is trying to import a file

            // Get the text after the quotes
            // const match = textUntilPosition.match(/[^'"]+$/);

            // const typed = match ? match[0] : '';
            // // Map '.' to './' and '..' to '../' for better autocomplete
            // const prefix = typed === '.' ? './' : typed === '..' ? '../' : typed;

            // const suggestions = this.props.entries
            //   .filter(({ item }) => item.path !== this.props.path && !item.virtual)
            //   .map(({ item }) => {
            //     let file = getRelativePath(this.props.path, item.path);

            //     if (
            //       // Only show files that match the prefix typed by user
            //       file.startsWith(prefix) &&
            //       // Only show files in the same directory as the prefix
            //       file.split('/').length <= prefix.split('/').length
            //     ) {
            //       // Remove typed text from the path so that don't insert it twice
            //       file = file.slice(typed.length);

            //       return {
            //         // Show only the file name for label
            //         label: file.split('/').pop(),
            //         // Don't keep extension for JS files
            //         insertText: item.type === 'file' ? file.replace(/\.(js|tsx?)$/, '') : file,
            //         kind:
            //           item.type === 'folder'
            //             ? monaco.languages.CompletionItemKind.Folder
            //             : monaco.languages.CompletionItemKind.File,
            //       };
            //     }

            //     return null;
            //   })
            //   .filter(Boolean);

            // return { suggestions };
          // } else {
          //   const deps = this._getAllDependencies(this.props.dependencies, this.props.sdkVersion);

          //   return {
          //     // User is trying to import a dependency
          //     suggestions: Object.keys(deps).map(name => ({
          //       label: name,
          //       detail: deps[name].version,
          //       kind: monaco.languages.CompletionItemKind.Module,
          //     })),
          //   };
          // }
        }
      },
    };

    this._hoverProviderJS = monaco.languages.registerHoverProvider('javascript', hoverProvider);
    this._hoverProviderTS = monaco.languages.registerHoverProvider('typescript', hoverProvider);

    this._completionProviderJS = monaco.languages.registerCompletionItemProvider(
      'javascript',
      completionProvider
    );
    this._completionProviderTS = monaco.languages.registerCompletionItemProvider(
      'typescript',
      completionProvider
    );
  }

  public componentWillUnmount() {
    this._subscription && this._subscription.dispose();
    this._editor && this._editor.dispose();
    this._hoverProviderJS && this._hoverProviderJS.dispose();
    this._hoverProviderTS && this._hoverProviderTS.dispose();
    this._completionProviderJS && this._completionProviderJS.dispose();
    this._completionProviderTS && this._completionProviderTS.dispose();
    this._typingsWorker && this._typingsWorker.terminate();
  }

  _initializeFile = (path: string, value: string) => {
    let model = findModel(path);

    if (model && !model.isDisposed()) {
      // If a model exists, we need to update it's value
      // This is needed because the content for the file might have been modified externally
      // Use `pushEditOperations` instead of `setValue` or `applyEdits` to preserve undo stack
      // @ts-ignore
      model.pushEditOperations(
        [],
        [
          {
            range: model.getFullModelRange(),
            text: value,
          },
        ]
      );
    } else {
      model = monaco.editor.createModel(
        value,
        undefined,
        monaco.Uri.from({ scheme: 'file', path })
      );

      model.updateOptions({
        tabSize: 2,
        insertSpaces: true,
      });
    }
  };

  _openFile = (path: string, value: string, focus?: boolean) => {
    this._initializeFile(path, value);

    const model = findModel(path);

    if (this._editor && model) {
      this._editor.setModel(model);

      // Restore the editor state for the file
      const editorState = editorStates.get(path);

      if (editorState) {
        this._editor.restoreViewState(editorState);
      }

      if (focus) {
        this._editor.focus();
      }
    }
  };

  // _getAllDependencies = (dependencies: DependencyList, sdkVersion: SDKVersion): DependencyList => ({
  //   // @ts-ignore
  //   ...mapValues(preloadedModules.dependencies[sdkVersion], version => ({ version })),
  //   ...dependencies,
  // });

  // _fetchTypings = (dependencies: DependencyList, sdkVersion: SDKVersion) => {
  //   const deps = this._getAllDependencies(dependencies, sdkVersion);

  //   Object.keys(deps).forEach(qualifier => {
  //     const { version } = deps[qualifier];

  //     // Parse the qualifier to get the package name
  //     // This will handle qualifiers with deep imports
  //     const match = /^(?:@([^/?]+)\/)?([^@/?]+)(?:\/([^@]+))?/.exec(qualifier);

  //     if (!match) {
  //       return;
  //     }

  //     const name = (match[1] ? `@${match[1]}/` : '') + match[2];

  //     if (requestedTypings.get(name) === version) {
  //       // Typing already loaded
  //       return;
  //     }

  //     requestedTypings.set(name, version);

  //     this._typingsWorker &&
  //       this._typingsWorker.postMessage({
  //         name,
  //         version,
  //       });
  //   });
  // };

  _addTypings = ({ typings }: { typings: { [key: string]: string } }) => {
    Object.keys(typings).forEach(path => {
      const extraLib = extraLibs.get(path);

      if (extraLib) {
        extraLib.js.dispose();
        extraLib.ts.dispose();
      }

      const uri = monaco.Uri.from({ scheme: 'file', path }).toString();

      const js = monaco.languages.typescript.javascriptDefaults.addExtraLib(typings[path], uri);
      const ts = monaco.languages.typescript.typescriptDefaults.addExtraLib(typings[path], uri);

      extraLibs.set(path, { js, ts });
    });
  };

  // _updateMarkers = (annotations: Annotation[]) =>
  //   // @ts-ignore
  //   monaco.editor.setModelMarkers(this._editor.getModel(), null, annotations);

  // _toggleMode = (mode: EditorMode) => {
  //   if (mode === 'vim' && this._editor) {
  //     this._vim = initVimMode(this._editor, this._statusbar);
  //   } else {
  //     this._vim && this._vim.dispose();
  //   }
  // };

  // _handleResize = debounce(() => this._editor && this._editor.layout(), 50, {
  //   leading: true,
  //   trailing: true,
  // });

  _typingsWorker: Worker | undefined;
  _hoverProviderJS: monaco.IDisposable | undefined;
  _hoverProviderTS: monaco.IDisposable | undefined;
  _completionProviderJS: monaco.IDisposable | undefined;
  _completionProviderTS: monaco.IDisposable | undefined;
  _subscription: monaco.IDisposable | undefined;
  _editor: monaco.editor.IStandaloneCodeEditor | null = null;
  _node: any;
  _statusbar: any;

  render() {
    return (
      <div className={css(styles.container)}>
        {/* <ResizeDetector onResize={this._handleResize}> */}
          <div
            ref={c => (this._node = c)}
            style={{minHeight: '500px'}}
            className={classnames(
              css(styles.editor),
              'snack-monaco-editor',
              // `theme-${this.props.theme}`
              'theme-light',
            )}
          />
        {/* </ResizeDetector> */}
      </div>
    );
  }
}

export default MonacoEditor;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,
  },
  editor: {
    height: '100%',
    width: '100%',
    minHeight: '500px',
  },
});
