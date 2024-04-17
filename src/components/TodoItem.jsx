import { Checkbox, IconButton } from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import "../App.css";

const TodoItem = (props) => {
  const { emitDeleteTodoItem } = props;
  const [todoItem, setTodoItem] = useState(props.data);
  const [isDirty, setIsDirty] = useState(false);
  const debounceTimeout = useRef(null);

  useEffect(() => {
    if (isDirty) {
      debounceTimeout.current = setTimeout(() => {
        fetch(`https://sql-web-app.azurewebsites.net/task/${todoItem.id}/`,
          {
            method: "PUT",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify(todoItem),
          }
        )
        .then((response) => {
            if (!response.ok) { throw new Error("Failed to update Todo item.") }
            return response.json();
          })
        .then((data) => {
            setTodoItem(data);
            setIsDirty(false);
          })
        .catch((error) => { console.error("Error updating Todo item:", error) });

      }, 500);
    }
    return () => { clearTimeout(debounceTimeout.current)};
  }, [todoItem, isDirty]);

  function updateTask(e) {
    const updatedTodoItem = { ...todoItem, name: e.target.value };
    setTodoItem(updatedTodoItem);
    setIsDirty(true);
  }

  function deleteTodoItem() {
    fetch(
      `https://sql-web-app.azurewebsites.net/task/${todoItem.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
        if (!response.ok) { throw new Error("Failed to delete Todo item.") }
        emitDeleteTodoItem(todoItem);
      }
    )
    .catch((error) => { console.error("Error deleting Todo item:", error) });
  }

  function handleCheckboxChange() {
    const updatedTodoItem = { ...todoItem, status: !todoItem.status };
    setTodoItem(updatedTodoItem);
    setIsDirty(true);
  }

  return (
    <>
      <tr>
        <td><input
          type="text"
          value={todoItem.name}
          className="itemText"
          onChange={updateTask}
        />
        </td>
        <td>{todoItem.dueDate}</td>
        <td>{todoItem.status ? "Complete" : "Incomplete"}</td>
        <td>
          <IconButton aria-label="delete" size="large" onClick={deleteTodoItem}>
          <DeleteIcon fontSize="inherit" color="primary" />
        </IconButton>
        </td>
        <td>
          <Checkbox checked={todoItem.status} onChange={handleCheckboxChange} />
        </td>
      </tr>
    </>
  );
};

export default TodoItem;
