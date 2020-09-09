import { createPrintStyle } from "./createPrintStyle";
import { renderAsync } from "./renderAsync";

/** print react component
 * @param element jsx element
 */
export const printComponent = async (element, size) => {
    const style = createPrintStyle(size);
    const container = await renderAsync(element);
    const res = window.print();
    if (container.parentNode) container.parentNode.removeChild(container);
    if (style.parentNode) style.parentNode.removeChild(style);
    return res;
};
