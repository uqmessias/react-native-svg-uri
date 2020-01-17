declare module 'xmldom' {
  import { XmlNode } from '@utils/types';
 
  namespace xmlDom {
    type RootNode = Omit<XmlNode, 'childNodes'> & {
      childNodes: XmlNode[];
    };

    class DOMParser {
      parseFromString(inputSvg: string): RootNode;
    }
  }

  export default  xmlDom;
}

declare var global: any;
