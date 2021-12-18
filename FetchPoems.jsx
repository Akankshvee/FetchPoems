const Pagination = ({ items, pageSize, onPageChange }) => {
  const { Button } = ReactBootstrap;
  if (items?.length <= 1 || items == undefined) return null;

  let num = Math.ceil(items.length / pageSize);
  console.log(num);
  let pages = range(1, num);
  const list = pages.map(page => {
    return (
      <Button key={page} onClick={onPageChange} className="page-item">
        {page}
      </Button>
    );
  });
  return (
    <nav>
      <ul className="pagination">{list}</ul>
    </nav>
  );
};
const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};
function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}
const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case "FETCH_SUCCESS":
      if(action.payload.status == undefined) {
        return {
          ...state,
          isLoading: false,
          isError: false,
          data: action.payload
        };
      }
      else {
        console.log('inside else')
        return{
          ...state,
          isLoading: false,
          isError: false,
          data: null };
    };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
        data: null
      };
    default:
      throw new Error();
  }
};
// App that gets data from Hacker News url
function App() {
  const { Fragment, useState, useEffect, useReducer } = React;
  const { Container, Row, Col } = ReactBootstrap;
  const [query, setQuery] = useState("adam");
  const [currentPage, setCurrentPage] = useState(1);
  const [line, setLines] = useState("");
  const pageSize = 10;
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "https://poetrydb.org/author/adam"
  );
  const handlePageChange = e => {
    setCurrentPage(Number(e.target.textContent));
  };
  let page = data;
  console.log(data);
  if (page?.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }


  return (
    <Fragment>
    <div>
      <div className="alignCenter">
    <form
      onSubmit={event => {
        doFetch(`https://poetrydb.org/author/${query}`);

        event.preventDefault();
      }}
    >
      <input
        type="text"
        value={query}
        onChange={event => setQuery(event.target.value)}
        className="labelSelect"
      />
      <button type="submit" className="choice">Search by Author</button>
    </form>
    </div>
    <div>
    
    {isError && <div className="msg">Something went wrong. Please refresh the page  and try again with a different keyword.</div>}

    {isLoading && <div className="msg">Loading ... </div>}

    {!isLoading && data == null ? (
      <div className="msg">No results found ... </div>
    ) : (
    <Row>
    <h1> {isLoading}</h1>
    <p> </p>
    <Pagination
        items={data}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      >
    </Pagination>
    <p> </p>
    <Col xs={4}>
    <h2>Search Results: </h2>
    <ul>
    {page?.map(({title, author, lines})  => (
        <li key={title.toString()}>
         
          <button value = {lines} onClick={(event) => setLines(event.target.value)} className="listAlign1" >
          {title}, {author}
      </button>
        </li>
        
      ))}
    </ul>
    </Col>
    <Col>
        <h2>Selected Poem: </h2>
        <div className="poemPreview1">{line.split(",").join(",\n")}</div>
    </Col>
    </Row>
    )}
    </div>
    </div>
  </Fragment>
  );
}

// ========================================
ReactDOM.render(<App />, document.getElementById("root"));
