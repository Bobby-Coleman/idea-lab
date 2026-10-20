import React, { Component } from 'react';
import Entry from '../../components/Entry/Entry';

class Notebook extends Component {

    render() {
    
        let entries = 
            <div>
                {this.props.entries.slice(0).reverse().map(entry =>
                 <Entry 
                 entry={entry}
                 handleDeleteEntry={this.props.handleDeleteEntry}
                 key={entry._id}
                 handleUpdateEntry={this.props.handleUpdateEntry}
                 />
                )}
            </div>

    if(this.props.entries.length) {
        return (
            entries
        )
    } else {
        return (
            <p className="word">Your Notebook is Empty</p>
            )
        }
    }
}

export default Notebook;
