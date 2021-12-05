var BookedSeats = [];
var Rows=["A","B","C","D","E","F","G","H","I","J"];
var Columns=12;
var TotalSeats=Rows.length*Columns;

function showAlert(message, className) {
	const div = document.createElement('div');
	div.className = `alert alert-${className}`;
	div.style.width = '70%';
	div.style.marginLeft = 'auto';
	div.style.marginRight = 'auto';
	div.appendChild(document.createTextNode(message));
	const container = document.querySelector('.myContainer');
	const form = document.querySelector('.selectionForm');
	container.insertBefore(div, form);
	setTimeout(() => document.querySelector('.alert').remove(), 3000); 
}

function showAlertBooking(message, className) {
	const div = document.createElement('div');
	div.className = `alert alert-${className}`;
	div.style.width = '70%';
	div.style.marginLeft = 'auto';
	div.style.marginRight = 'auto';
	div.appendChild(document.createTextNode(message));
	const container = document.querySelector('.screen-ui');
	const form = document.querySelector('#screen');
	container.insertBefore(div, form);
	setTimeout(() => document.querySelector('.alert').remove(), 3000); 
}

var movieList = document.querySelector('#movies')
document.getElementById('filter').addEventListener('keyup', filterMovie)

function filterMovie(e) {
	e.preventDefault();
	var text = e.target.value.toLowerCase();
    var movies = movieList.getElementsByClassName('movie');
    Array.from(movies).forEach(function(movie) {
        var movieName = movie.lastElementChild.innerHTML;
        if(movieName.toLowerCase().indexOf(text) != -1){
            document.getElementById('p').style.display = 'none';
            movie.style.display = 'block';
        }
        else{
            document.getElementById('p').textContent = 'Sorry! No items found related to your search.';
            document.getElementById('p').style.display = 'block';
            document.getElementById('p').style.color = 'orange';
            movie.style.display = 'none';
        }
    })
}

function convertIntToSeatNumbers(seats){
	var bookedSeats="";
	_.each(seats,function(seat){
		var row=Rows[parseInt(parseInt(seat)/12)];
		var column=parseInt(seat)%12;
		if(column==0){
			column=12;
		}
		if(_.indexOf(seats,seat)==seats.length-1){
			bookedSeats=bookedSeats+row+column;
		}
		else{
			bookedSeats=bookedSeats+row+column+",";
		}
	});
	return bookedSeats;
}

var InitialView = Backbone.View.extend({
	events:{
		"click #submitSelection": "submitForm"
	},
	submitForm : function(){
		var reservedseats=JSON.parse(localStorage.getItem('ReservedSeats'));
		var availableSeats=TotalSeats;
		var selectedNumberOfSeats=$('#seats').val();
		if(reservedseats!=null)
			availableSeats=TotalSeats-reservedseats.length;
		if(!$('#name').val()){
			showAlert("Name is required", 'danger');
		}
		else if(!selectedNumberOfSeats){
			showAlert("Number of seats is required", 'danger');
		}
		else if(parseInt(selectedNumberOfSeats)>availableSeats){
			var msg = "You can only select "+availableSeats+" seats";
			showAlert(msg, 'danger');
		}
		else
		{
			$(".error").html("");
			screenUI.showView();
		}
	}
});
var initialView = new InitialView({el:$('.selectionForm')});

var ScreenUI=Backbone.View.extend({
	events:{
		"click .empty-seat,.booked-seat":"toggleBookedSeat",
		"click #confirmSelection":"bookTickets"
	},
	initialize:function(){
		var tableheaderTemplate = _.template($("#table-screen-header").html());
		var tableBodyTemplate=_.template($("#table-screen-body").html());
		var data={"rows":Rows,"columns":Columns};
		$("#screen-head").after(tableheaderTemplate(data));
		$("#screen-body").after(tableBodyTemplate(data));	
	},
	hideView:function(){
		$(this.el).hide();
	},
	showView:function(){
		$(this.el).show();
	},
	toggleBookedSeat:function(event){
		var id="#"+event.currentTarget.id;
		if($(id).attr('class')=='empty-seat' && BookedSeats.length<$('#seats').val()){
			BookedSeats.push(id.substr(1));
			console.log("ID of seat: ", id);
			$(id).attr('src','img/booked-seat.png');
			$(id).attr('class','booked-seat');
		}
		else if($(id).attr('class')=='booked-seat'){
			BookedSeats=_.without(BookedSeats,id.substr(1));
			$(id).attr('src','img/empty-seat.png');
			$(id).attr('class','empty-seat');
		}
	},
	updateTicketInfo:function(){
		var bookedSeats=convertIntToSeatNumbers(BookedSeats);
		var movieName = $('#selectedMovie').val();
		var totalPrice = 0;
		if (movieName == 'Jurassic Park')
			totalPrice = 80 * BookedSeats.length;	
		else if (movieName == 'Avengers: Infinity War')
			totalPrice = 100 * BookedSeats.length;
		else 
			totalPrice = 60 * BookedSeats.length;
		$("#ticket-sold-info").append("<tr><td>"+$('#name').val()+"</td><td>"+$('#seats').val()+"</td><td>"
			+$('#selectedMovie').val()+"</td><td>"+bookedSeats+"</td><td>"+totalPrice+"</td></tr>");
	},
	bookTickets:function(){
		if(BookedSeats.length==parseInt($('#seats').val())) {
			$(".error").text("");
			var reservedseats=JSON.parse(localStorage.getItem('ReservedSeats'))||[];
			_.each(BookedSeats,function(bookedSeat){
				reservedseats.push(bookedSeat);
			});
			var nameSeatsJSON=JSON.parse(localStorage.getItem('NameSeatsJSON'))||{};
			var movieName = $('#selectedMovie').val();
			var totalPrice = 0;
			if (movieName == 'Jurassic Park')
				totalPrice = 80 * BookedSeats.length;	
			else if (movieName == 'Avengers: Infinity War')
				totalPrice = 100 * BookedSeats.length;
			else 
				totalPrice = 60 * BookedSeats.length;
			nameSeatsJSON[$('#name').val()] = [BookedSeats, movieName, totalPrice];
			localStorage.setItem('NameSeatsJSON',JSON.stringify(nameSeatsJSON));
			localStorage.setItem('ReservedSeats',JSON.stringify(reservedseats));
			this.updateTicketInfo();
			window.location.reload();
			alert("Ticket Successfully booked!");
		}
		else{
			var msg = "Please select exactly "+ $('#seats').val()+" seats";
			showAlertBooking(msg, 'warning');
		}		
	},
});

var screenUI = new ScreenUI({el:$('.screen-ui')});
screenUI.hideView();

var TicketInfo=Backbone.View.extend({
	initialize:function(){
		var items=[];
		var json=JSON.parse(localStorage.getItem('NameSeatsJSON'));
		if(json!=null){
		_.each(json,function(key,value){
			var name=value;
			var number=key[0].length;
			var bookedSeats=convertIntToSeatNumbers(key[0]);
			var movieName = key[1];
			var totalPrice = key[2];
			items.push({names:name,numbers:number,movienames:movieName,seats:bookedSeats,totalprices:totalPrice});
		});
		var data={"items":items};
		var ticketInfoBody=_.template($("#table-ticket-info").html());
		$("#ticket-sold-info").html(ticketInfoBody(data));
		}
	}
});

var ticketInfo = new TicketInfo({el:$('.table-responsive')});
