/**
 * http://usejsdoc.org/
 */

//1.http://expressjs.com/en/starter/hello-world.html 여기서 서버를 복사해서 붙여 넣는다.
const express = require('express');
//2. npm install body-parser --save 해줌.
//3.인스톨후 바디파서 리콰이어 해줌.
const bodyParser = require('body-parser'); 
//7.https://www.npmjs.com/package/multer 들어가서 npm install --save multer 인스톨 후 리콰이어 해줌 
const multer  = require('multer');
//15.패스를 리콰이어 해줘야함
const path = require('path');
//10.https://www.npmjs.com/package/express-error-handler 들어가서 
//npm i express-error-handler --save 인스톨 후 리콰이어 해줌.
const errorHandler = require('express-error-handler')
//26. 쿠키 생성(client)
//https://www.npmjs.com/package/cookie-parser
//npm install cookie-parser --save 인스톨후 리콰이어
const cookieParser = require('cookie-parser');
//29.세션 생성(server)
//https://www.npmjs.com/package/express-session
//npm install express-session --save 인스톨 후 리콰이어
const session = require('express-session');

//40.mysql
//https://www.npmjs.com/package/mysql 들어가서 
//npm install mysql --save 설치후 리콰이어
const mysql = require('mysql');

const app = express();


//4교시
//33. p.338 뷰 템플릿으로 로그인 웹문서 만들기
//34. views폴더 만든후 sam.html -> sam.ejs로 변경 해줌.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');



//27.쿠키파서 주입
app.use(cookieParser());

//30.세션파서 주입
//32.책과 같이 변경 그러면 카운트가 올라감.
app.use(session({
	secret: 'keyboard cat',
	resave: true,
	saveUninitialized: true
}))

/*app.use(session({
	  secret: 'keyboard cat',
	  resave: false,
	  saveUninitialized: true,
	  cookie: { secure: true }
	}))*/




//6.http://expressjs.com/en/starter/static-files.html 들어가서
//바디파서 보다 위에 넣어줌.
app.use(/*'/static', 생략시켜줌*/ express.static(path.join(__dirname, 'public')));

//4. 라우팅보다는 위에 리콰이어 밑에 넣어줌.
//5.public 폴더 만든 후 a.html파일을 만들어줌.
//parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }));
//parse application/json 
app.use(bodyParser.json());

//8.보기좋게 바디파서 밑에 붙여넣어줌!
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, '/uploads'); //저장되는 폴더를 가르킴.
	},
	filename: function (req, file, cb) {
		//9.수정이 필요함..파일 이름쪽!!!!
		var fname = file.originalname;
		var idx = fname.lastIndexOf('.');
		fname = fname.substring(0, idx) + Date.now() + fname.substring(idx);
		cb(null, fname);
//		cb(null, file.fieldname + '-' + Date.now());
	}
});

var upload = multer({ storage: storage });





app.cnt = 0; //22.cnt 만들어줌..

app.get('/', function (req, res) {
	res.send('Hello World!');
});

//18. 한개 더 복사해서 변경 : 라우팅 순서가 중요  a,b가 출력됨.
app.get('/pro/:member', function (req, res, next) {
	console.log('a');
	var member = req.params.member; //내부에서만 사용이 가능함.
	//24.if문 추가
	if(member == 'guest'){
		req.member = 'guest'; //만약에 맴버에 quest 넣고
		res.redirect('/guestpro'); // /guestpro 보내 //여기서 보내지면 새로운 req로 인식됨.
		return;
	}
	req.member = member; // 19.req.를 사용하면 밑에서도 사용가능.
	app.cnt++;
	next(); // 
});

//25. 하나더 만들어줌 => /guestpro
app.get('/guestpro', function (req, res) {
	console.log('d');
	res.send('티아카데미 : ' + req.member); //새로운 req 라서 undefined가 나옴
});

//2교시 시작.
//17./pro/:member ==> http://192.168.205.160:3000/pro/korea
app.get('/pro/:member', function (req, res) {
	console.log('b');
	res.send('Hello World! : ' + req.member); //20. next();는 같은 req라서 여기서만  req.member 출력가능.
});

//21.위에 그대로 카피 => /pro1 교체 => undefined 출력됨.
//23. 서버가 켜지는 동안은 app.cnt는 계속 유지됨
app.get('/pro1/:member', function (req, res) {
	console.log('c');
	res.send('Hello World! : ' + req.member + app.cnt); 
});


//28. 쿠키 라우팅
//쓰기
app.get('/makecookie', function(req, res) {
	//maxAge를 사용하면 쿠키 지속시간을 나타냄.
	res.cookie('user', '이문규', {maxAge : 1000 * 60 * 60 * 24}); //user라는 이름으로 korea가 들어감
	res.cookie('email', 'xelloss09@daum.net' /*,{maxAge : 0}*/); //email라는 이름으로  이메일주소가 들어감
	res.send('make Cookies success : ');
});

//읽기
app.get('/showcookie', function(req, res) {
	console.dir(req.cookies);
	var output = `반갑습니다. ${req.cookies.user} email : ${req.cookies.email}`;
	res.send('make Cookies success : ' + output);
});

//삭제
app.get('/deletecookie', function(req, res) {
	res.clearCookie('user');
	res.redirect('/showcookie');
});

//31. 세션 라우팅
//일정한 시간이 지나거나 창이 닫이기 전까진 유지가됨.
app.get('/sesstiontest', function(req, res) {
	if( !req.session.count ){ //count가 없으면~
		req.session.count = 0;
	}
	req.session.count++;
	res.send('count : ' + req.session.count );
});


//35. 뷰 템플릿 라우팅 만들기
app.get('/sam', function(req, res){
	var name = req.query.name;
	res.render('sam', {name : name, email : 'aaa@aaa.com', hobby : ['축구','야구','농구','배구']}); //html 페이지가 읽힘. js 객체를 넣을 수 있다.
//	res.send('test name : ' + name); //sam?name=이문규 
});

//36.연습 예제
//구구단 출력 라우팅 주소 gugudan 파라미터로 단(7) 받아서 그 단출력
//테이블 테그로 반복해서 출력
app.get('/gugudan/:dan', function(req, res){
	var dan = req.params.dan;
	res.render('gugudan',{dan : dan});
});



//37.객체 출력
//app.get('/viewBoard/:num', (req, res) => {
//var num = req.params.num;
//var obj = {
//num : num,
//writer : '홍길동',
//title : '제목입니다.',
//content : '내용입니다.',
//idate : '2017-08-07 12:58',
//cnt : 233
//};
//var type = req.query.type;
//if(type == 'json'){
//res.json(obj);
//}else{
//res.render('viewBoard', {board : obj});
//}
//});



//38.현업에서 객체 출력
app.get('/viewBoard/:num', (req, res) => {
	var num = req.params.num;
	var obj = {
			num : num,
			writer : '홍길동',
			title : '제목입니다.',
			content : '내용입니다.',
			idate : '2017-08-07 12:58',
			cnt : 233
	};
	res.render('viewBoard', {board : obj});
});

//선생님 추천 , viewBoardJson 만들어줌
app.get('/viewBoardJson/:num', (req, res) => {
	var num = req.params.num;
	var obj = {
			num : num,
			writer : '홍길동',
			title : '제목입니다.',
			content : '내용입니다.',
			idate : '2017-08-07 12:58',
			cnt : 233
	};
	res.json(obj);
});


//42. 로그인
app.post('/login', function(req, res){
	var id = req.body.id;
	var pw = req.body.pw;

	//41.mysql 연결하기
	var connection = mysql.createConnection({
		host     : '192.168.205.160',
		user     : 'root',
		password : '1234',
		database : 'tacademy'
	});
	connection.connect();	
	connection.query('select * from member where id = ? and pw = ?',[id, pw], function (error, results, fields) {
		if (error) {
			console.log(error);
			res.send('서버가 비지합니다');
		}
		if(results.length == 0){
			res.render('loginfail');
		}else{
			res.render('loginsuccess', {user : results[0]});
		}
		console.log('The solution is: ', results);
//		console.log('The fields is: ', fields);
		connection.end();
	});
});

//43. 회원가입 만들기
app.post('/memberInsert', function(req,res){
	var name = req.body.name;
	var id = req.body.id;
	var pw = req.body.pw;
	var email = req.body.email;

	//41.mysql 연결하기
	var connection = mysql.createConnection({
		host     : '192.168.205.160',
		user     : 'root',
		password : '1234',
		database : 'tacademy'
	});
	connection.connect();	
	connection.query('insert into member values(null, ?, ?, ?, ?, now())',[name, id, pw, email], function (error, results, fields) {
		if (error) {
			console.log(error);
			res.send('서버가 비지합니다');
		}
//		console.log('results.affectRows' + results.affectdRows);
		if(results.affectedRows == 1){
			res.send('회원가입에 성공'); //성공 랜더링해주자.
		}else{
			res.send('회원가입 실패, 다시해주세요'); //실패 랜더링해주자.
		}
		console.log('The results is: ', results);
		console.log('The fields is: ', fields);
//		console.log('The solution is: ', results);
		connection.end();
	});
});


//44.회원정보리스트 페이지 생성
app.get('/list', function(req, res){

	//41.mysql 연결하기
	var connection = mysql.createConnection({
		host     : '192.168.205.160',
		user     : 'root',
		password : '1234',
		database : 'tacademy'
	});
	connection.connect();	
	connection.query('select *, date_format(idate,\'%Y-%m-%d\') idate from member;', function (error, results, fields) {
		if (error) {
			console.log(error);
			res.send('서버가 비지합니다');
		}
		if(results.length == 0){
			res.render('listfail');
		}else{
			res.render('memberList', {user : results});
//			var obj = {memberList : results};
//			res.json(obj);
		}
		connection.end();
	});
});

//45.json 회원리스트
app.get('/listjson', function(req, res){

	//41.mysql 연결하기
	var connection = mysql.createConnection({
		host     : '192.168.205.160',
		user     : 'root',
		password : '1234',
		database : 'tacademy'
	});
	connection.connect();	
	connection.query('select *, date_format(idate,\'%Y-%m-%d\') idate from member;', function (error, results, fields) {
		if (error) {
			console.log(error);
			res.send('서버가 비지합니다');
		}
		if(results.length == 0){
			res.render('listfail');
		}else{
//			res.render('memberList', {user : results});
			var obj = {memberList : results};
			res.json(obj);
		}
		connection.end();
	});
});

//14.500번 error 붙여줌.(404 오류 보다는 위에 있어야함) 
app.use(function (err, req, res, next) {
	console.log(err);
	res.send('서버가 바쁩니다.');
});


//11.에러 핸들러 붙여넣어줌.
//12.public에 nfound.html 만들어줌.
handler = errorHandler({
	static: {
		'404': './public/nfound.html'
	}
});


//13.404 오류처리 가져와서 붙여 넣는다.
//After all your routes... 
//Pass a 404 into next(err) 
app.use( errorHandler.httpError(404) );
//Handle all unhandled errors: 
app.use( handler );

//16.supervisor app.js 서버 실행을 해줌.
app.listen(3000, function () {
	console.log('Example app listening on port 3000! 서버시작!!');
});



/*유효범위
유지범위

정의 내리자.

http프로토콜에서 나오는 말.

page : 라우터별로 잡힘
request :  req.으로 한개의 req는 유지가 됨.
session : 유저마다 따로 따로 할당  / 브라우져별로 다르게 할당됨. 
Application : 사용자별로 따로 따로 잡히는게 아니라 전부 다 잡힘.

 */