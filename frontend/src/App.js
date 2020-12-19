import React, { Component } from 'react';
import './App.css';
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

const itemheight = 80;
var checkedS = [];  // deeps track of checkbox states

// Item class to render each of the table rows
class Item extends Component {
    constructor(props){
        super(props);
        this.state = {
          checked: checkedS[this.props.i],
        }
    }

    handleCheckboxChange = event => {
      this.setState({ checked: event.target.checked });
      checkedS[this.props.i] = event.target.checked;
    }

    render(){
        return (
        <div className="item" style={{top:this.props.top,height:this.props.itemheight,backgroundColor:this.props.background}}>
          <div className="check">
            <label>
              <input type="checkbox"
                checked={this.state.checked}
                onChange={this.handleCheckboxChange}
              />
              <span></span> 
            </label>
          </div>
          <div className={"left"}>
            <div style={{fontWeight:'bold',fontSize:'1.2em'}}> {this.props.last_name}, {this.props.first_name} </div>
            <small> {this.props.email_address} </small>
          </div>
          <div className={"right"}>
            <p>{this.props._position}</p>
            <p>{this.props.town}</p>
          </div>
        </div>)
          
    }
}

const formValid = ({ formErrors, formValues, ...rest }) => {
  let valid = true;
  // validate form errors being empty
  Object.values(formErrors).forEach(val => {
    val.length > 0 && (valid = false);
  });
  // validate that form was filled out
  Object.values(formValues).forEach(val => {
    val === "" && (valid = false);
  });
  return valid;
};

const emailRegex = RegExp(
  /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
);

class App extends Component {
  constructor() {
    super();
    this.state = {
      members : [],   // all members being displayed in table
      newMembers: [],   // added mambers that haven't been saved
      removedMembers: [],   // removed members that haven't been saved
      updatedMembers: [],   // updated members that haven't been saved
      maxid: 0,   // max id value of members saved to database
      currid: 0,  // the last id assigned to a member

      // variables related to the form
      formValues: {
        firstName: "",
        lastName: "",
        email: "",
        position: "",
        town: ""
      },
      id: null,
      formErrors: {
        firstName: "",
        lastName: "",
        email: "",
        position: "",
        town: ""
      },
      loaded: false,   // indicates if form currently contains a loaded member
      dropdownOpen: false,
      submitError: ""
    };
    this.containerStyle={height:this.state.members.length * itemheight}
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleLoad = this.handleLoad.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.handleRemove = this.handleRemove.bind(this)
    this.toggle = this.toggle.bind(this);
  }

  componentDidMount() {
    fetch('/data')
      .then(response => response.json())
      .then(response => {
        response.data.sort((a,b) => a.last_name.localeCompare(b.last_name));  // table is initially sorted by last name
        this.setState({ members: response.data });
        checkedS = Array(this.state.members.length).fill(false);
        this.state.members.map( member => {
          if (member.id > this.state.maxid) {this.setState({maxid:member.id, currid:member.id});}
        })
      })
      .catch(err => console.error(err))
  }

  // render table rows
  renderRows(){
    let result=[];
    let i=0;
    this.state.members.map( member => {
      if (i>=0 && i<this.state.members.length) {
        result.push(
          <Item key={member.id} first_name={member.first_name} last_name={member.last_name} email_address={member.email_address} _position={member._position} town={member.town} i={i}
             background={i%2 ? 'beige' : 'white'} top={i*itemheight} itemheight={itemheight} />
        );
      }
      i++;
    })
    return result;
  }

  // controls clicking Submit button
  handleSubmit = e => {
    e.preventDefault();
    if (formValid(this.state)) {
      // don't allow duplicate team members
      var dup = false;
      this.state.members.map( member => {
        if (member.last_name===this.state.formValues.lastName && member.first_name===this.state.formValues.firstName && member.email_address===this.state.formValues.email
          && member._position===this.state.formValues.position && member.town===this.state.formValues.town && member.id!==this.state.id) {
          dup = true;
        }
      });
      if (dup) {
        this.setState({submitError:'duplicate team member'});
      }
      // case for updating a member
      else if (this.state.loaded) {
        // change the updated member in members
        this.state.members.map( member => {
          if (member.id === this.state.id) {
            member.first_name=this.state.formValues.firstName;
            member.last_name=this.state.formValues.lastName;
            member.email_address=this.state.formValues.email;
            member._position=this.state.formValues.position;
            member.town=this.state.formValues.town;
          }
        })
        // if updated member is unsaved, change them in newMembers as well
        if (this.state.id > this.state.maxid) {
          this.state.newMembers.map( newMember => {
            if (newMember.id === this.state.id) {
              newMember.first_name=this.state.formValues.firstName;
              newMember.last_name=this.state.formValues.lastName;
              newMember.email_address=this.state.formValues.email;
              newMember._position=this.state.formValues.position;
              newMember.town=this.state.formValues.town;
            }
          })
        }
        // if updated member is saved, add them to updatedMembers
        else {
          let newArray = this.state.updatedMembers.slice();
          newArray.push({last_name:this.state.formValues.lastName,first_name:this.state.formValues.firstName,email_address:this.state.formValues.email,_position:this.state.formValues.position,town:this.state.formValues.town,id:this.state.id});
          this.setState({updatedMembers:newArray});
        }
        this.setState({formValues:{firstName:"",lastName:"",email:"",position:"",town:""},id:null,loaded:false,submitError:''});
        document.getElementById("memberForm").reset();
      }
      // case for adding new member
      else {
        let newArray = this.state.members.slice();
        this.state.currid++;
        const newMember = {"last_name":this.state.formValues.lastName,"first_name":this.state.formValues.firstName,"email_address":this.state.formValues.email,
          "_position":this.state.formValues.position,"town":this.state.formValues.town,"checked":false,"id":this.state.currid};
        newArray.unshift(newMember);
        checkedS.unshift(false);
        this.setState({members:newArray});
        newArray = this.state.newMembers.slice();
        newArray.push(newMember);
        this.setState({newMembers:newArray});
        this.setState({formValues:{firstName:"",lastName:"",email:"",position:"",town:""},id:null,submitError:''});
        document.getElementById("memberForm").reset();
      }
    }
    // if form invalid display errors (invalid if any field empty)
    else {
      let formErrors = { ...this.state.formErrors };
      formErrors.firstName =
        this.state.formValues.firstName.length < 1 ? "required" : "";
      formErrors.lastName =
        this.state.formValues.lastName.length < 1 ? "required" : "";
      formErrors.email = emailRegex.test(this.state.formValues.email)
        ? ""
        : "required";
      formErrors.position =
        this.state.formValues.position.length < 1 ? "required" : "";
      formErrors.town =
        this.state.formValues.town.length < 1 ? "required" : "";
      this.setState({ formErrors }, () => console.log(this.state));
      console.error("FORM INVALID - DISPLAY ERROR MESSAGE");
    }
  };

  // handle form changes
  handleChange = e => {
    e.preventDefault();
    const { name, value } = e.target;
    let formErrors = { ...this.state.formErrors };

    switch (name) {
      case "firstName":
        this.setState({formValues:{firstName: e.target.value, lastName:this.state.formValues.lastName,email:this.state.formValues.email,position:this.state.formValues.position,town:this.state.formValues.town}});
        formErrors.firstName =
          value.length < 1 ? "required" : "";
        break;
      case "lastName":
        this.setState({formValues:{lastName: e.target.value, firstName:this.state.formValues.firstName,email:this.state.formValues.email,position:this.state.formValues.position,town:this.state.formValues.town}});
        formErrors.lastName =
          value.length < 1 ? "required" : "";
        break;
      case "email":
        this.setState({formValues:{email: e.target.value, lastName:this.state.formValues.lastName,firstName:this.state.formValues.firstName,position:this.state.formValues.position,town:this.state.formValues.town}});
        formErrors.email = emailRegex.test(value)
          ? ""
          : "invalid email address";
        break;
      case "position":
        this.setState({formValues:{position: e.target.value, lastName:this.state.formValues.lastName,email:this.state.formValues.email,firstName:this.state.formValues.firstName,town:this.state.formValues.town}});
        formErrors.position =
          value.length < 1 ? "required" : "";
        break;
      case "town":
        this.setState({formValues:{town: e.target.value, lastName:this.state.formValues.lastName,email:this.state.formValues.email,position:this.state.formValues.position,firstName:this.state.formValues.firstName}});
        formErrors.town =
          value.length < 1 ? "required" : "";
        break;
      default:
        break;
    }

    this.setState({ formErrors, [name]: value });
  };  

  // toggle for Sort By menu
  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  handleSortBy(name) {
    // update member.checked states to maintain them after sort
    let i=0;
    this.state.members.map( member => {
      member.checked = checkedS[i];
      i++;
    })

    switch (name) {
      case "lastA": this.state.members.sort((a,b) => a.last_name.localeCompare(b.last_name)); break;
      case "lastD": this.state.members.sort((a,b) => b.last_name.localeCompare(a.last_name)); break;
      case "firstA": this.state.members.sort((a,b) => a.first_name.localeCompare(b.first_name)); break;
      case "firstD": this.state.members.sort((a,b) => b.first_name.localeCompare(a.first_name)); break;
      case "emailA": this.state.members.sort((a,b) => a.email_address.localeCompare(b.email_address)); break;
      case "emailD": this.state.members.sort((a,b) => b.email_address.localeCompare(a.email_address)); break;
      case "posA": this.state.members.sort((a,b) => a._position.localeCompare(b._position)); break;
      case "posD": this.state.members.sort((a,b) => b._position.localeCompare(a._position)); break;
      case "townA": this.state.members.sort((a,b) => a.town.localeCompare(b.town)); break;
      case "townD": this.state.members.sort((a,b) => b.town.localeCompare(a.town)); break;
      default: console.log('did not sort'); break;
    }

    checkedS = [];
    this.state.members.map( member => {
      checkedS.push(member.checked);
    })
  }

  // controls clicking Load button
  handleLoad = e => {
    e.preventDefault();
    let count = 0;
    let i=0;
    this.state.members.map( member => {
      if (checkedS[i]) count++;
      member.checked = checkedS[i];
      i++;
    });

    // only load if exactly one member selected
    if (count === 1) {
      this.state.members.map( member => {
        if(member.checked) {
          this.setState({formValues:{lastName:member.last_name, firstName:member.first_name, email:member.email_address, position:member._position, town:member.town}, id:member.id});
        }
      });
      this.setState({loaded:true, submitError:''});
    }
    else {
      this.setState({formValues:{lastName:'', firstName:'', email:'', position:'', town:''}, id:null, loaded:false, submitError:'select exactly 1 member'});
      console.log('ERROR count = ', count);
    }
    this.setState({formErrors:{lastName:'',firstName:'',email:'',position:'',town:''}});
  }

  // controls clicking Remove button
  handleRemove = e => {
    e.preventDefault();
    let newArray = [];
    let i=0;
    this.state.members.map( member => {
      member.checked = checkedS[i];
      // remove any checked member from members
      if (member.checked) {
        // if saved member add to removedMembers
        if (member.id <= this.state.maxid) {
          console.log(member.id);
          this.state.removedMembers.push({id:member.id});
        }
        // if unsaved member remove from newMembers
        else {
          let newArray2 = [];
          this.state.newMembers.map( newMember => {
            if (newMember.id !== member.id) {
              newArray2.push(newMember);
            }
          });
          this.setState({newMembers:newArray2});
        }
      }
      else {
        newArray.push(member);
      }
      i++;
    });
    this.setState({members:newArray});
    checkedS = Array(newArray.length).fill(false);
    this.setState({formValues:{lastName:'', firstName:'', email:'', position:'', town:''}, id:null, loaded:false, submitError:''});
    this.setState({formErrors:{lastName:'',firstName:'',email:'',position:'',town:''}});
    document.getElementById("memberForm").reset();
  }

  // controls clicking Save button
  handleSave = e => {
    e.preventDefault();

    // add new members to database
    this.state.newMembers.map( newMember => {
      fetch('/new', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(newMember)
        }).then(function(response) {
            if (response.status >= 400) {
              throw new Error("Bad response from server");
            }
        }).catch(function(err) {
            console.error('Error posting: ' + err.stack);
        }).then((updatedMember) => {
          this.setState({submitError:''})
        });
    });

    // update members in database
    this.state.updatedMembers.map( updatedMember => {
      fetch('/update', {
              method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(updatedMember)
        }).then(function(response) {
            if (response.status >= 400) {
                throw new Error("Bad response from server");
            }
        }).catch(function(err) {
            console.log(err)
        }).then((updatedMember) => {
          this.setState({submitError:''})
        });
    });

    // delete members from database
    this.state.removedMembers.map( removedMember => {
      fetch('/delete', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(removedMember)
        }).then(function(response) {
            if (response.status >= 400) {
              throw new Error("Bad response from server");
            }
            return response.json();
        }).catch(function(err) {
            console.log(err)
        }).then((updatedMember) => {
          this.setState({submitError:''})
        });
    });

    // replace any temporary id's with id's from database
    fetch('http://localhost:4000/data')
      .then(response => response.json())
      .then(response => {
        response.data.map( readMember => {
          console.log(readMember, readMember.id);
          this.state.members.map( member => {
            console.log(member, member.id);
            if (readMember.last_name===member.last_name && readMember.first_name===member.first_name && readMember.email_address===member.email_address 
              && readMember._position===member._position && readMember.town===member.town) {
              console.log('here');
              member.id = readMember.id;
              console.log(member.id, readMember.id)
            }
            if (member.id > this.state.maxid) {this.setState({maxid:member.id, currid:member.id});}
          }
        )})
      })
      .catch(err => console.error(err))

    this.setState({newMembers:[],updatedMembers:[],removedMembers:[],submitError:''});
  }

  render() {
    const { formErrors } = this.state;

    return (
      <div className="App">
        <div className="wrapper">
          <div className="form-wrapper">
            <div style={{fontWeight:'bold',fontSize:'1em',paddingLeft:'10px',paddingBottom:'10px'}}>Add Team Member</div>
            <form id="memberForm" onSubmit={this.handleSubmit} noValidate>
            <div className="lastName">
                <input
                  className={formErrors.lastName.length > 0 ? "error" : null}
                  placeholder="Last Name"
                  type="text"
                  name="lastName"
                  value={this.state.formValues.lastName}
                  noValidate
                  onChange={this.handleChange}
                />
                {formErrors.lastName.length > 0 && (
                  <span className="errorMessage">{formErrors.lastName}</span>
                )}
              </div>
              <div className="firstName">
                <input
                  className={formErrors.firstName.length > 0 ? "error" : null}
                  placeholder="First Name"
                  type="text"
                  name="firstName"
                  value={this.state.formValues.firstName}
                  noValidate
                  onChange={this.handleChange}
                />
                {formErrors.firstName.length > 0 && (
                  <span className="errorMessage">{formErrors.firstName}</span>
                )}
              </div>
              <div className="email">
                <input
                  className={formErrors.email.length > 0 ? "error" : null}
                  placeholder="Email Address"
                  type="email"
                  name="email"
                  value={this.state.formValues.email}
                  noValidate
                  onChange={this.handleChange}
                />
                {formErrors.email.length > 0 && (
                  <span className="errorMessage">{formErrors.email}</span>
                )}
              </div>
              <div className="position">
                <input
                  className={formErrors.position.length > 0 ? "error" : null}
                  placeholder="Position"
                  type="text"
                  name="position"
                  value={this.state.formValues.position}
                  noValidate
                  onChange={this.handleChange}
                />
                {formErrors.position.length > 0 && (
                  <span className="errorMessage">{formErrors.position}</span>
                )}
              </div>
              <div className="town">
                <input
                  className={formErrors.town.length > 0 ? "error" : null}
                  placeholder="Town"
                  type="text"
                  name="town"
                  value={this.state.formValues.town}
                  noValidate
                  onChange={this.handleChange}
                />
                {formErrors.town.length > 0 && (
                  <span className="errorMessage">{formErrors.town}</span>
                )}
              </div>
              <div className="Submit">
                <button type="submit">Submit</button>
                <span className="errorMessage">{this.state.submitError}</span>
              </div>
            </form>
          </div>
          <div className="tableWrapper">
            <div className="row">
              <div className={"left"}>
                <div style={{fontWeight:'bold',fontSize:'1em',paddingLeft:'10px',paddingBottom:'40px'}}>Team Member List</div>
              </div>
              <div className={"right"}>
                <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                  <DropdownToggle caret>
                    Sort By{' '}
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem onClick={() => this.handleSortBy('lastA')}>Last Name Asc</DropdownItem>
                    <DropdownItem onClick={() => this.handleSortBy('lastD')}>Last Name Desc</DropdownItem>
                    <DropdownItem onClick={() => this.handleSortBy('firstA')}>First Name Asc</DropdownItem>
                    <DropdownItem onClick={() => this.handleSortBy('firstD')}>First Name Desc</DropdownItem>
                    <DropdownItem onClick={() => this.handleSortBy('emailA')}>Email Asc</DropdownItem>
                    <DropdownItem onClick={() => this.handleSortBy('emailD')}>Email Desc</DropdownItem>
                    <DropdownItem onClick={() => this.handleSortBy('posA')}>Position Asc</DropdownItem>
                    <DropdownItem onClick={() => this.handleSortBy('posD')}>Position Desc</DropdownItem>
                    <DropdownItem onClick={() => this.handleSortBy('townA')}>Town Asc</DropdownItem>
                    <DropdownItem onClick={() => this.handleSortBy('townD')}>Town Desc</DropdownItem>
                  </DropdownMenu>
                </ButtonDropdown>
              </div>
            </div>
            <div ref="viewPort"  className="viewPort" >
              <div className="itemContainer" style={this.containerStyle}>
                  {this.renderRows()}    
              </div>
            </div>
            <div className="row">
              <div className={"left"}>
                <div className="Load">
                  <button type="button" onClick={this.handleLoad}>Load</button> <button type="button" onClick={this.handleSave}>Save</button>
                </div>
              </div>
              <div className={"right"}>
                <div className="Remove">
                  <button type="button" onClick={this.handleRemove}>Remove</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
