const url = '../docs/sample_pdf3.pdf';

let PdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const scale = 1.5,
    canvas = document.querySelector('#pdf-render'),
    cntx = canvas.getContext('2d');
 
const renderPage = num => {
    pageIsRendering = true;
    PdfDoc.getPage(num).then(page => {
        // Setting the scale
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderCntx = {
            canvasContext : cntx,
            viewport
        }
        page.render(renderCntx).promise.then(() => {
            pageIsRendering = false;
            if(pageNumIsPending != null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });
        // Current Page
        document.querySelector('#page-num').textContent = num;
    });
};
 
const queueRenderPage = num => {
  if (pageIsRendering) {
    pageNumIsPending = num;
  } else {
    renderPage(num);
  }
};

// To display the previous page
const displayPrevPage = () => {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
};

// To display the next page
const displayNextPage = () => {
  if (pageNum >= PdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
};

pdfjsLib.getDocument(url).promise.then(pdfDoc => {
    PdfDoc = pdfDoc;
    console.log(PdfDoc);
    document.querySelector('#total-pages').textContent = PdfDoc.numPages;
    renderPage(pageNum)
})
.catch(err => {
    // If pdf is unavailable
    const div = document.createElement('div');
    div.className = 'error';
    div.appendChild(document.createTextNode(err.message));
    document.querySelector('body').insertBefore(div, canvas);
    document.querySelector('.top-bar').style.display = 'none';
});


document.querySelector('#previous').addEventListener('click', displayPrevPage);
document.querySelector('#next').addEventListener('click', displayNextPage);