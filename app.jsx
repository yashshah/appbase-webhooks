var Select= React.createClass({

		getInitialState: function() {
			var self=this;
			$.ajaxSetup({
				crossDomain: true,
				xhrFields: {
					withCredentials: true
				}
			});

			$.ajax({
				type: "GET",
				url: 'https://accapi.appbase.io/user',
				dataType: 'json',
				contentType: "application/json",

				success: function(data) {
					self.setState({options_app: data.body.apps});
				}.bind(this),
				error: function(xhr, status, err) {
					console.error(this.props.url, status, err.toString());
				}.bind(this)
			});

			return {
				options_app: [],
				options_type: [],
				app_id: '',
				app_type: ''
			};
		},

		changeApp: function(event){
			console.log("inside app")
			this.setState({app_id: event.target.value});
			var index = event.nativeEvent.target.selectedIndex;
			var app_name=event.nativeEvent.target[index].text;
			var self=this;
			$.ajaxSetup({
				crossDomain: true,
				xhrFields: {
					withCredentials: true
				}
			});

			$.ajax({
				type: "GET",
				url: 'https://accapi.appbase.io/app/' + event.target.value + '/permissions',
				dataType: 'json',
				contentType: "application/json",
				success: function(data) {
					this.props.onSelected(data.body[0].username, data.body[0].password, app_name)
	  	    		$.ajax({
						type: "GET",
						xhrFields: {
						  withCredentials: true
						},
						headers: {
						  "Authorization": "Basic " + btoa(data.body[0].username+':'+data.body[0].password)
						},
						url: 'http://scalr.api.appbase.io/'+app_name+'/_mapping',
						dataType: 'json',
						contentType: "application/json",

						success: function(data) {
							self.setState({options_type: Object.keys(data[app_name].mappings)});
						}.bind(this),
						error: function(xhr, status, err) {
							console.error(this.props.url, status, err.toString());
						}.bind(this)
					});



				}.bind(this),
				error: function(xhr, status, err) {
					console.error(this.props.url, status, err.toString());
				}.bind(this)
			});
		},
		changeType: function(event){
			this.setState({app_type: event.target.value});
			this.props.onSelectedType(event.target.value)
		},
		render: function() {
			options_app = $.map(this.state.options_app, function(app_id, app_name){
				return <option value={app_id}>{app_name}</option>;
			});
			options_type = $.map(this.state.options_type, function(app_type){
				return <option value={app_type}>{app_type}</option>;
			});
			return(
				<div>
				<select id="app_info" onChange={this.changeApp} value={this.state.app_id} ref="appbase_app_select">
					<option> Select your App </option>
					{options_app}
				</select>
				<select id="app_type" onChange={this.changeType} value={this.state.app_type} ref="appbase_type_select">
					<option> Select your Type </option>
					{options_type}
				</select>
				</div>
			)
		}
	});
	
	var StreamBrowser = React.createClass({
		// Set the initial component state
		getInitialState: function(){
			// Set initial application state using props
			var query={
			  url: 'https://api.sendgrid.com/api/mail.send.json',
			  method: 'POST',
			  headers: {
			  	"Content-Type" : "application/x-www-form-urlencoded"
			  },
			  string_body: "to=yash@appbase.io&amp;toname=Yash&amp;to=siddharth@appbase.io&amp;toname=Siddharth&amp;subject=New Tshirt request&amp;text={{{_source}}}&amp;from=Appbase.io&amp;api_user=yashshah&amp;api_key=enteryourpassword",
			  count: 1
			}
			return {
				app_name: '',
				username: '',
				type: '',
				password: '',
				query: JSON.stringify(query,null,'\t'),
			  	posts: []
			};

		},

		setValue: function(username, password, app_name){
    		this.setState({username: username});
    		this.setState({password: password});
    		this.setState({app_name: app_name});

    		$.ajax({
			type: "GET",
			xhrFields: {
			  withCredentials: true
			},
			headers: {
			  "Authorization": "Basic " + btoa(username+':'+password)
			},
			url: 'http://scalr.api.appbase.io/'+app_name+'/_mapping',
			dataType: 'json',
			contentType: "application/json",

			success: function(data) {
				console.log(Object.keys(data[app_name].mappings))
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	  	},
	  	setType: function(type){
	  		this.setState({
	  			type:type 
	  		});
	  	},
		executeQuery: function(e){
			// Preserve self reference
			var self = this;
			var appbaseRef = new Appbase({
			  url: 'https://scalr.api.appbase.io',
			  appname: this.state.app_name,
			  username: this.state.username,
			  password: this.state.password
			});

			var match_all_query = {
				type: this.state.type,
				  body: {
				    query: {
				      match_all: {}
				    }
				  }
			}
			appbaseRef.searchStreamToURL(match_all_query,JSON.parse(this.state.query, null,'\t')).on('data', function(response) {
			    console.log(response)
			    // console.log("searchStream(), new match: ", response);
			}).on('error', function(error) {
			    console.log("caught a searchStream() error: ", error)
			})
			e.preventDefault();
		},
		handleChange: function(event){
			this.setState({query: event.target.value});
		},

		render: function() {
			return (

				<div id="col12">
					<form className="queryForm" onSubmit={this.executeQuery}>
						<h2> Appbase Webhook dashboard </h2>
						<Select onSelected={this.setValue} onSelectedType={this.setType}/>
						<select>
							<option>Sendgrid</option>
						</select>
				        <textarea placeholder="Query"  value={this.state.query} onChange={this.handleChange}/>
				        <button type="submit"> Execute </button>
				    </form>
				</div>
			);
		}
	
	});
	
	React.render(
	  <StreamBrowser />,
	  document.getElementById('container')
	);