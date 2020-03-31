import React, { Component } from 'react'
import './App.css'

class App extends Component {
  state = {
    todoList: [],
    activeItem: {
      id: null,
      title: '',
      completed: false
    },
    editing: false
  }

  getCookie = name => {
    var cookieValue = null
    if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';')
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim()
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === name + '=') {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
          break
        }
      }
    }
    return cookieValue
  }

  componentDidMount() {
    this.fetchTasks()
  }

  fetchTasks() {
    fetch('http://127.0.0.1:8000/api/task-list/')
      .then(res => res.json())
      .then(data =>
        this.setState({
          todoList: data
        })
      )
  }

  handleChange = e => {
    // const name = e.target.name
    const value = e.target.value
    this.setState({
      activeItem: {
        ...this.state.activeItem,
        title: value
      }
    })
  }

  handleSubmit = e => {
    e.preventDefault()
    // console.log(this.state.activeItem)

    const csrftoken = this.getCookie('csrftoken')
    let url = 'http://127.0.0.1:8000/api/task-create/'

    if (this.state.editing === true) {
      url = `http://127.0.0.1:8000/api/task-update/${this.state.activeItem.id}/`
      this.setState({
        editing: false
      })
    }

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      },
      body: JSON.stringify(this.state.activeItem)
    })
      .then(res => {
        this.fetchTasks()
        this.setState({
          activeItem: {
            id: null,
            title: '',
            completed: false
          }
        })
      })
      .catch(err => console.log('Error: ', err))
  }

  startEdit = task => {
    this.setState({
      activeItem: task,
      editing: true
    })
  }

  deleteItem = task => {
    const csrftoken = this.getCookie('csrftoken')

    fetch(`http://127.0.0.1:8000/api/task-delete/${task.id}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      }
    })
      .then(res => {
        this.fetchTasks()
      })
      .catch(err => console.log('Error: ', err))
  }

  toggleStrike = task => {
    task.completed = !task.completed

    const csrftoken = this.getCookie('csrftoken')
    const url = `http://127.0.0.1:8000/api/task-update/${task.id}/`

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      },
      body: JSON.stringify({ completed: task.completed, title: task.title })
    }).then(() => {
      this.fetchTasks()
    })
  }

  render() {
    const tasks = this.state.todoList

    return (
      <div className='container'>
        <div id='task-container'>
          <div id='form-wrapper'>
            <form onSubmit={this.handleSubmit} id='form'>
              <div className='flex-wrapper'>
                <div style={{ flex: 6 }}>
                  <input
                    type='text'
                    className='form-control'
                    name='title'
                    id='title'
                    placeholder='Add Task'
                    value={this.state.activeItem.title}
                    onChange={this.handleChange}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type='submit'
                    className='btn btn-warning'
                    id='submit'
                    name='Add'
                  />
                </div>
              </div>
            </form>
          </div>

          <div id='list-wrapper'>
            {tasks.map(task => (
              <div key={task.id} className='task-wrapper flex-wrapper'>
                <div
                  onClick={() => this.toggleStrike(task)}
                  style={{ flex: 7 }}
                >
                  {task.completed === false ? (
                    <span>{task.title}</span>
                  ) : (
                    <strike>{task.title}</strike>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <button
                    onClick={() => this.startEdit(task)}
                    className='btn btn-sm btn-outline-info'
                  >
                    Edit
                  </button>
                </div>
                <div style={{ flex: 1 }}>
                  <button
                    onClick={() => this.deleteItem(task)}
                    className='btn btn-sm btn-outline-danger'
                  >
                    X
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
}

export default App
