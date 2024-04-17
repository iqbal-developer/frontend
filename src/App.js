import React, { useEffect, useState } from "react";
import TodoItem from "./components/TodoItem";
import Footer from "./components/Footer";
import './App.css'

const App = () => {

  const [todoItems, setTodoItems] = useState(null);
  const [text, setText] = useState("");
  const [date, setDate] = useState("");

  
  // The moment the component renders, set the toDoItems
  useEffect(() => {
    console.log("useEffect Loaded.");
    if (!todoItems) {
      fetch("https://sql-web-app.azurewebsites.net/task/")
        .then((response) => response.json())
        .then((data) => { setTodoItems(data) })
        .catch((error) => { console.error("Error fetching data:", error) });
    }
  }, [todoItems]);

  // Render toDoItems conditionally
  let content;
  if (todoItems === null) { content = <p>Loading data...</p> }
  else if (todoItems.length > 0) { content = todoItems.map((todoItem) => (<TodoItem data={todoItem} key={todoItem.id} emitDeleteTodoItem={handleDeleteTodoItem} />)) }
  else { content = <p>No items.</p> }

  // Functions controlling the form
  const handleTextChange = (event) => { setText(event.target.value)};
  const handleDateChange = (event) => { setDate(event.target.value)};

  const handleSubmit = (event) => {
    event.preventDefault();
    fetch("https://sql-web-app.azurewebsites.net/task/", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ name: text, status: false, dueDate: date }),
    })
    .then((response) => {
        if (!response.ok) { throw new Error("Failed to add new Todo item.") }
        return response.json();
      })
    .then((data) => { setTodoItems(todoItems ? [...todoItems, data] : [data]) })
    .catch((error) => { console.error("Error adding new Todo item:", error) });
  }

  function handleDeleteAll() {
    let idsArray = [];
    fetch("https://sql-web-app.azurewebsites.net/task")
      .then((res) => res.json())
      .then((data) => {
        data.forEach((element) => idsArray.push(element.id));
        idsArray.forEach((element) => {
          fetch(`https://sql-web-app.azurewebsites.net/task/${element}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            })
          })
      }
    )
    setTodoItems([])
  }

  function handleDeleteTodoItem(item) {
    const updatedTodoItems = todoItems.filter((data) => data.id !== item.id);
    setTodoItems(updatedTodoItems);   
  }


  return (
    <div className='main'>
      <div class="container">
        <header>
          <h1>Todo List</h1>
          <div class="input-section">
            <input 
              type="text" 
              placeholder="Add a todo . . ." 
              class="input input-bordered input-secondary w-full max-w-xs" 
              onChange={handleTextChange} 
              name="text"
              value={text}
              />
            <input 
              type="date" 
              class="input input-bordered input-secondary w-full max-w-xs schedule-date" 
              onChange={handleDateChange} 
              name="date"
              value={date}
              />
            <button onClick={handleSubmit} class="btn btn-secondary add-task-button">
              <i class="bx bx-plus bx-sm" ></i>
            </button>
          </div>
        </header>

        {/* Filtering */}
        <div class="todos-filter">
          <div class="dropdown">
            <label tabindex="0" class="btn m-1">Filter</label>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
              <li><a href="/">All</a></li>
              <li><a href="/">Incomplete</a></li>
              <li><a href="/">Complete</a></li>
            </ul>
          </div>
          <button class="btn btn-secondary delete-all-btn" onClick={handleDeleteAll} >
            Delete All
          </button>
        </div>
        <table class="table w-full">
          <thead>
            <tr>
              <th>Task</th>
              <th>Due Date</th>
              <th>Status</th>
              <th >Actions</th>
              <th></th>
            </tr>
          </thead>
          <tbody class="todos-list-body">
            {content}
          </tbody>
        </table>
      </div>
      <Footer />
    </div>
  )
}
export default App
