import * as React from 'react';
import { GenericComponentWrapper } from './../components/GenericComponent';

export interface IPageProps { page: any; }
export interface IPageState { }

class PageRenderer extends React.Component<IPageProps, IPageState> {

  public pageIterator = () => {
    function iteratePage(pageContent: any) {
      console.log('this: ', this)
      return pageContent.map((el: any, index: number) => {
        if (el.type === 'Container') {
          return (<div key={el.id} style={{ border: '2px solid black' }}>{iteratePage(el.children)}</div>);
        } else {
          return (
            <GenericComponentWrapper
              key={el.id}
              id={el.id}
              component={el.type}
              isValid={true}
              title={el.title}
              dataBinding={el.dataBinding}
            // formData={{}}
            // handleDataChange={this.handleComponentDataUpdate}
            // getTextResource={this.getTextResource}
            // validationMessages={this.props.validationResults}
            />
          );
        }
      });
    }

    return (
      <div>
        <h3>PageIterator function</h3>
        {iteratePage(this.props.page.pageContent)}
      </div>
    )
  }

  public render() {
    console.log('page: ', this.props.page);
    return (
      <div>
        <h2>This is the renderer</h2>
        {this.pageIterator()}

        {/* <h2>inline iterator</h2>
        {this.props.page.pageContent.map((el: any, index: number) => (
          <div key={index}> {index}, {el.type}  </div>
        ))} */}
      </div>
    )
  }
}

export default PageRenderer;
