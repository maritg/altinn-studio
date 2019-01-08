import * as React from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.main';
//import { StaticServices } from 'monaco-editor/esm/vs/editor/standalone/browser/standaloneServices';

//@ts-ignore
global.MonacoEnvironment = {
  getWorker(_: string, label: string) {
    switch(label) {
      case 'json':
        // @ts-ignore
        return new Worker('monaco-editor/esm/vs/language/json/json.worker');
      case 'typescript':
      case 'javascript':
        // @ts-ignore
        return new Worker('monaco-editor/esm/vs/language/typescript/ts.worker');
      default:
        // @ts-ignore
        return new Worker('monaco-editor/esm/vs/editor/editor.worker');
    }
  },
};

export interface IMonacoEditorProps {
  path: string;
  value: string;
  //onOpenPath: (path: string) => void;
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
  language: string;
}

export default class MonacoEditor extends React.Component<IMonacoEditorProps> {
  private _subscription: monaco.IDisposable | undefined;
  private _editor: monaco.editor.IStandaloneCodeEditor | null = null;
  private _node: any;

  public componentDidMount() {
    const { path, value, language, ...options} = this.props;

    const model = monaco.editor.createModel(value, language);
    this._editor = monaco.editor.create(this._node, options);
    this._editor.setModel(model);
    this._subscription = model.onDidChangeContent(() => {
      this.props.onValueChange(model.getValue());
    });
  }

  public componentDidUpdate(prevProps: any) {
    const {path, value, language, onValueChange, ...options} = this.props;
    this._editor.updateOptions(options);

    const model = this._editor.getModel();
    if (value !== model.getValue()) {
      model.pushEditOperations(
        [],
        [
          {
            range: model.getFullModelRange(),
            text: value,
          },
        ],
        null,
      );
    }
  }

  public componentWillUnmount() {
    this._editor && this._editor.dispose();
    this._subscription && this._subscription.dispose();
  }

  public render() {
    return <div ref={(c) => this._node = c} style={style} />;
  }
}

const style = {
  height: '500px',
};
