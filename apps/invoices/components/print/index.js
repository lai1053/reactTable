import { printComponent } from "./printComponent";
import { printHtml } from "./printHtml";
import { printExistingElement } from "./printExistingElement";

export default {
    printHtml,
    printComponent,
    printExistingElement
};
/*
//use your own react component
await printComponent(<Component prop={data} />);

// use html in a string
await printHtml("<div>Hello world</div>");

// use selector to print an existing html element
await printExistingElement("div.elementClass #elementID");
 */
