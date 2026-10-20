import React, { Component } from 'react';
import './Entry.css'
class Entry extends Component {
    

    state = {
        isEditing: null,
        entryData: {
            wordOne: this.props.entry.wordOne,
            wordTwo: this.props.entry.wordTwo,
            entry: this.props.entry.entry,
            title: this.props.entry.title,
        }
    }

    handleEditing = (entryId) => {
        this.setState({isEditing: entryId})
    }

    handleChange = e => {
        const entryData = {...this.state.entryData, [e.target.name]: e.target.value}
        this.setState({
            entryData
        })
    }

    handleSubmit = e => {
        this.props.handleUpdateEntry(this.state.entryData, this.props.entry._id)
    }

    render() {

        let entry;

        if (this.state.isEditing === this.props.entry._id) {
            entry =    
        <form onSubmit={this.handleSubmit}>
            <div className="entry-container" key={this.props.entry.id}>
                <div className="entry-editing">
                    <div className="entry-words">
                        <h4 className="entry-word">{this.props.entry.wordOne}</h4>
                        <h4 className="entry-word">{this.props.entry.wordTwo}</h4>
                    </div>   
                    <div>
                        <input
                            className='entry-line'
                            placeholder="Think of a title"
                            name='title'
                            type='text'
                            value={this.state.entryData.title}
                            onChange={this.handleChange}
                            required>
                        </input>
                        <div className="entry-group">
                            <textarea
                            className='entry-line'
                            name='entry'
                            type='text'
                            value={this.state.entryData.entry}
                            onChange={this.handleChange}
                            required
                            rows="10" cols="40"
                            >
                            </textarea>
                        </div>
                    </div>
                    <button 
                    className="btn btn-small"
                    type="submit">
                        Submit
                    </button>
                </div>
            </div>
        </form>   
        } else {
            entry =      
        <div className="entry-container" key={this.props.entry.id}>
            <div className="entry">
                <div className="entry-words">
                    <h4 className="entry-word">{this.props.entry.wordOne}</h4>
                    <h4 className="entry-word">{this.props.entry.wordTwo}</h4>
                </div>
                <div>
                    <label>{this.props.entry.title}</label>
                    <p className="entry-paragraph">{this.props.entry.entry}</p>
                    <button className="btn-cancel btn-small" onClick={() => this.props.handleDeleteEntry(this.props.entry._id)}>Delete</button>
                    <button className="btn btn-small" onClick={() => this.handleEditing(this.props.entry._id)}>Edit</button>
                </div>
            </div>
        </div>
        }
        return (
            [entry]
        )
    }
}

export default Entry;