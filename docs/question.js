var difficulty= [
    {id:1, name:'Basic', icon:'c1.png'},
    {id:2, name:'Intermediate' , icon:'c4.png'},
    {id:3, name:'Proficient' , icon:'c5.png'}
  ];

  
// global
var bulk = {};  //list of question content
var div = {}; // list of question container
    div.g = {}; // g f
    bulk.g = {};

var tpl = {};
tpl.ht;

$(document).ready(function(){
    $.ajax({
        url: 'tpl_ht.html',
        type :'GET',
        cache: false,
        async: false,
        beforeSend : function(){  
        },
      })
      .done(function(resp) {
        tpl.ht = resp;
    });

    $.ajax({
        url: 'question_list.json',
        dataType :'json',
        type :'GET',
        cache: false,
        async: false,
        beforeSend : function(){  
    
        },
      })
      .done(function(resp) {
        getQuestionView(resp);
    });

    $(document.body).delegate('.view-wrapper[data-type="answer"] .select-answer','click', function(e){
        e.preventDefault();
        var thiS = $(this);
        if(!thiS.hasClass('view')){
            var content = thiS.data('type');
            var id = thiS.data('id');
            thiS.closest('.tpl-dropdown').addClass('selected').find('.dropdown-parent').html(content)
            .attr('data-id', id).attr('data-type', content);
            var reload = thiS.closest('.tpl-dropdown').html();
            thiS.closest('.tpl-dropdown').html(reload);
        }
    });

    $(document.body).delegate('.view-wrapper[data-type="answer"] .btn-answer','click', function(e){
        var thiS = $(this);
        if(!thiS.hasClass('view')){
            if(!thiS.hasClass('selected')){
                thiS.closest('.answer-group').find('.btn-answer').removeClass('selected');
                thiS.addClass('selected'); 
            }
        }
    });

    $(document.body).delegate('.view-wrapper[data-type="answer"] .view-msg .msg-close','click', function(e){
        thiS = $(this);
        thiS.closest('.view-msg').hide();
    });

    $(document.body).delegate('.view-wrapper[data-type="answer"] .view-msg .btn-skipped','click', function(e){
        thiS = $(this);
        var item = {};
        thiS.closest('.view-msg').hide();
        item.questionId = thiS.closest('.question-group').data('id');
        $('.view-wrapper[data-type="answer"] .question-group[data-id="'+item.questionId+'"] .btn-check .data').attr('data-skippedstate',1);
        var reloadBtn = $('.view-wrapper[data-type="answer"] .question-group[data-id="'+item.questionId+'"] .btn-check').html();
        $('.view-wrapper[data-type="answer"] .question-group[data-id="'+item.questionId+'"] .btn-check').html(reloadBtn);
        $('.view-wrapper[data-type="answer"] .question-group[data-id="'+item.questionId+'"] .btn-check').click();
    });

    $(document.body).delegate('.view-wrapper[data-type="answer"] .text-answer','keyup', function(){
        var thiS = $(this);
        if(!thiS.hasClass('view')){
            var content = thiS.text();
            if(contentAnalys(content)==false){
                thiS.removeClass('selected'); 
            }else{
                thiS.addClass('selected'); 
            }
        }
    });

    $(document.body).delegate('.view-wrapper[data-type="answer"] .btn-check','click', function(e){
        e.preventDefault();
        var thiS = $(this);
        var item = {};
        item.questionType = thiS.closest('.question-group').data('type');
        item.questionId = thiS.closest('.question-group').data('id');
        item.questionIndex = parseInt(thiS.closest('.question-group').data('index'));
        if(thiS.find('.data').data('skippedstate')==1){
            item.skippedState = true;
        }else{
            item.skippedState = false;
        }
        item.answerId;
        var question = 'Question '+item.questionId+': ';
        switch (item.questionType) {
            case 'mcq':
                item.question = $('.question-group[data-id="'+item.questionId+'"]');
                item.answerId = item.question.find('.btn-answer.selected').data('id');
                if(item.answerId==undefined){
                    console.log(question+'no answer selected');
                    item.question.prepend('<div style="align-items: center;" class="msg-full item-center">Please answer the question</div>');
                    setTimeout(function() {
                        item.question.find('.msg-full').remove();
                    }, 500);
                    return false;
                }
                var data = bulk.g.questions[item.questionIndex];
                for(var q in data.question.data){
                    if(data.question.data[q].dbId==item.questionId){
                        data.answerSelected = item.answerId;
                        if(item.skippedState!=false){
                            createPreview($('.view-wrapper[data-type="answer"] .question-group[data-id="'+item.questionId+'"] .question-content'), data, 'view');
                            $('.view-wrapper[data-type="answer"] .question-group[data-id="'+item.questionId+'"] .question-content').find('.btn-answer').addClass('view');
                        }else{
                            createPreview(null , data, 'check');
                        }
                        break;
                    }
                }     
                break;
            case 'subjective':
            
                break;
            case 'isi_tempat_kosong':    
                item.question = $('.question-group[data-id="'+item.questionId+'"]');
                item.answerId = item.question.find('.text-answer.selected').data('id');
                if(item.answerId==undefined){
                    console.log(question+'no answer selected');
                    item.question.prepend('<div style="align-items: center;" class="msg-full item-center">Please answer the question</div>');
                    setTimeout(function() {
                        item.question.find('.msg-full').remove();
                    }, 500);
                    return false;
                }
                item.answerType = [];
                item.question.find('.answer-group').each(function(){
                    var group = $(this);
                    group.find('.text-answer').each(function(){
                        var textAnswer = $(this);
                        var obj = {};
                        obj.id = textAnswer.data('id');
                        obj.type = textAnswer.text();
                        item.answerType.push(obj);
                    });
                });
                var data = bulk.g.questions[item.questionIndex];
                for(var q in data.question.data){
                    if(data.question.data[q].dbId==item.questionId){
                        data.answerSelected = item.answerType;
                        for(var z in item.answerType){
                            if(contentAnalys(item.answerType[z].type)==false){
                                item.question.prepend('<div style="align-items: center;" class="msg-full item-center">Please answer all the question</div>');
                                setTimeout(function() {
                                    item.question.find('.msg-full').remove();
                                }, 500);
                                return false;
                            }
                        } 
                        if(item.skippedState!=false){
                            createPreview($('.view-wrapper[data-type="answer"] .question-group[data-id="'+item.questionId+'"] .question-content'), data, 'view');
                            $('.view-wrapper[data-type="answer"] .question-group[data-id="'+item.questionId+'"] .question-content').find('.text-answer').addClass('view');
                        }else{
                            createPreview(null , data, 'check');
                        }
                        break;                          
                    }
                }
                break;
            
            case 'pengelasan':    
                break;
            case 'susun_semula':    
                item.question = $('.question-group[data-id="'+item.questionId+'"]');
                item.answerId = item.question.find('.btn-answer.selected').data('id');
                // if(item.answerId==undefined){
                //     console.log(question+'no answer selected');
                //     return false;
                // }

                item.answerType = [];
                item.question.find('.answer-group .row-reorder.reorder .tpl-sortable').each(function(){
                    var group = $(this);
                    //var arr = [];
                    var obj = {};
                    obj.id = group.data('id');
                    obj.type = [];
                    group.find('li.group').each(function(){
                        obj.type.push($(this).data('id'));
                    });
                    item.answerType.push(obj);
                });
                var data = bulk.g.questions[item.questionIndex];
                for(var q in data.question.data){
                    if(data.question.data[q].dbId==item.questionId){
                        data.answerSelected = item.answerType;                          
                        if(item.skippedState!=false){
                            createPreview($('.view-wrapper[data-type="answer"] .question-group[data-id="'+item.questionId+'"] .question-content'), data, 'view');
                            $('.view-wrapper[data-type="answer"] .question-group[data-id="'+item.questionId+'"] .question-content').find('.btn-answer').addClass('view');    
                        }else{
                            createPreview(null , data, 'check');
                        }
                        break; 
                    }
                }     
                break;
            case 'benar_palsu':  
                item.question = $('.question-group[data-id="'+item.questionId+'"]');
                item.answerId = item.question.find('.btn-answer.selected').data('id');
                if(item.answerId==undefined){
                    console.log(question+'no answer selected');
                    item.question.prepend('<div style="align-items: center;" class="msg-full item-center">Please answer the question</div>');
                    setTimeout(function() {
                        item.question.find('.msg-full').remove();
                    }, 500);
                    return false;
                }

                item.answerType = [];
                item.question.find('.answer-group').each(function(){
                    var group = $(this);
                    var obj = {};
                    obj.id = group.find('.btn-answer.selected').data('id');
                    obj.type = group.find('.btn-answer.selected').data('type');
                    item.answerType.push(obj);
                });
                var data = bulk.g.questions[item.questionIndex];
                for(var q in data.question.data){
                    if(data.question.data[q].dbId==item.questionId){
                        data.answerSelected = item.answerType;
                        for(var z in item.answerType){
                            if(item.answerType[z].id==undefined){
                                console.log(question+'have some answer no selected');
                                item.question.prepend('<div style="align-items: center;" class="msg-full item-center">Please answer all the question</div>');
                                setTimeout(function() {
                                    item.question.find('.msg-full').remove();
                                }, 500);
                                return false;
                            }
                        }                           
                        if(item.skippedState!=false){
                            createPreview($('.view-wrapper[data-type="answer"] .question-group[data-id="'+item.questionId+'"] .question-content'), data, 'view');
                            $('.view-wrapper[data-type="answer"] .question-group[data-id="'+item.questionId+'"] .question-content').find('.btn-answer').addClass('view');
                        }else{
                            createPreview(null , data, 'check');
                        }
                        break;
                    }
                }            
                break;
            case 'padanan':   
                item.question = $('.question-group[data-id="'+item.questionId+'"]');
                item.answerId = item.question.find('.tpl-dropdown.selected .dropdown-parent').data('id');
                if(item.answerId==undefined){
                    console.log(question+'no answer selected');
                    item.question.prepend('<div style="align-items: center;" class="msg-full item-center">Please answer the question</div>');
                    setTimeout(function() {
                        item.question.find('.msg-full').remove();
                    }, 500);
                    return false;
                } 

                item.answerType = [];
                item.question.find('.answer-group').each(function(){
                    var group = $(this);
                    var obj = {};
                    obj.id = group.find('.tpl-dropdown.selected .dropdown-parent').data('id');
                    obj.type = group.find('.tpl-dropdown.selected .dropdown-parent').data('type');
                    item.answerType.push(obj);
                });
                console.log(item.answerType);
                var data = bulk.g.questions[item.questionIndex];
                for(var q in data.question.data){
                    if(data.question.data[q].dbId==item.questionId){
                        data.answerSelected = item.answerType;
                        for(var z in item.answerType){
                            if(item.answerType[z].id==undefined){
                                console.log(question+'have some answer no selected');
                                item.question.prepend('<div style="align-items: center;" class="msg-full item-center">Please answer all the question</div>');
                                setTimeout(function() {
                                    item.question.find('.msg-full').remove();
                                }, 500);
                                return false;
                            }
                        }                           
                
                        if(item.skippedState!=false){
                            createPreview($('.view-wrapper[data-type="answer"] .question-group[data-id="'+item.questionId+'"] .question-content'), data, 'view');
                            $('.view-wrapper[data-type="answer"] .question-group[data-id="'+item.questionId+'"] .question-content').find('.select-answer').addClass('view');    
                        }else{
                            createPreview(null , data, 'check');
                        }
                        break;
                    }
                }      

                break;
        }

        var question = bulk.g.questions[item.questionIndex];
        console.log(question);
        var state = question.answered.state.toString();
        if(question.answered.state.length!=0){
            var msg =  $('.view-wrapper[data-type="answer"] .question-group[data-id="'+item.questionId+'"] .question-content .question-action');
            if(state.indexOf('0') <= -1){
                if(item.skippedState==false){
                    $('.view-wrapper[data-type="answer"] .question-group[data-id="'+item.questionId+'"] .btn-check .data').attr('data-skippedstate',1);
                    var reloadBtn = $('.view-wrapper[data-type="answer"] .question-group[data-id="'+item.questionId+'"] .btn-check').html();
                    $('.view-wrapper[data-type="answer"] .question-group[data-id="'+item.questionId+'"] .btn-check').html(reloadBtn);
                    $('.view-wrapper[data-type="answer"] .question-group[data-id="'+item.questionId+'"] .btn-check').click();
                    getBottomMsg(msg, true);
                }else{
                    getBottomMsg(msg, true);
                }
            }else{
                if(item.skippedState==false){
                    getBottomMsg(msg, false);
                }
            }
        }
    });

    $(document.body).delegate('.view-wrapper[data-type="answer"] .btn-showhint','click', function(){
        var thiS = $(this);
        thiS.closest('.question-group').find('.question-hint').show();
        thiS.closest('.question-group').find('.question-action div[data-type="hint"]').hide();

    });
    $(document.body).delegate('.view-wrapper[data-type="answer"] .btn-gethint, .view-wrapper[data-type="answer"] .btn-morehint','click', function(){
        var thiS = $(this);
        var questionId = thiS.closest('.question-group').data('id');
        var count = thiS.data('count');
        for(var x in bulk.g.questions){
            var data = bulk.g.questions[x];
            for(var q in data.question.data){
                if(data.question.data[q].dbId==questionId){
                    createPreviewDetail(thiS.closest('.question-group').find('.view-group.question-hint'), data, 'hint', count);
                    break;
                }
            }
        }        
    });  

    $(document.body).delegate( '.view-wrapper[data-type="answer"] .question-group .btn-showdetail', 'click', function(e){
        e.stopImmediatePropagation();
        var thiS = $(this);
        var type  = thiS.data('type');
        var questionId = thiS.closest('.question-group').data('id');
        if(!thiS.hasClass('show')){
            thiS.addClass('show');
            thiS.html(thiS.html().replace('Show', 'Hide'));
            console.log(bulk.g.questions);
            for(var x in bulk.g.questions){
                var data = bulk.g.questions[x];
                for(var q in data.question.data){
                    if(data.question.data[q].dbId==questionId){
                        var length = 0;
                        if(type=='hint'){
                           length = data.hint.data.length;
                        }
                        if(type=='description'){
                            length = null;
                         }
                        createPreviewDetail(thiS.closest('.question-group').find('.view-group.question-'+type), data, type, length);
                        break;
                    }
                }
            }
        }else{
            thiS.removeClass('show');
            thiS.html(thiS.html().replace('Hide', 'Show'));
            thiS.closest('.question-group').find('.view-group.question-'+type).html('').hide();
        }
    });

    // $(document.body).delegate('','click', function(){
        
    // });

});

function getBottomMsg(thiS, cond){
    if(cond==true){
        var msgHTML =  '<div class="view-msg item-left">'+
                            '<div class="msg-icon"><i class="fa fa-star good" aria-hidden="true"></i></div>'+
                            '<div class="msg-content">'+
                                '<div class="title">Good Work!</div>'+
                                '<div class="desc">Keep going.</div>'+
                                '</div>'+
                            '<i class="fa fa-times msg-close" aria-hidden="true"></i>'+
                        '</div>';
        var fireworkHTML = '<div class="firework">'+
                                '<div class="before"></div>'+
                                '<div class="after"></div>'+
                                '<div class="audio" style="width:0px;height:0px;opacity:0;"></div>'+
                           '</div>';
        var audioHTML =    '<audio autoplay style="" controls>'+
                              '<source src="correct4.mp3" type="audio/mpeg">'+
                          '</audio> ';
        thiS.find('.view-bottom-msg').remove();
        thiS.append('<div class="view-bottom-msg">'+msgHTML+fireworkHTML+'</div>');
        thiS.find('.firework .audio').html(audioHTML);
        thiS.find('.firework').show().addClass('pyro');
        setTimeout(function() {
            thiS.find('.firework').fadeOut(1000).removeClass('pyro');
        }, 1000);
    }else{
        var msgHTML =  '<div class="view-msg item-left">'+
                            '<div class="msg-icon"><i class="fa fa-repeat bad" aria-hidden="true"></i></div>'+
                            '<div class="msg-content">'+
                                '<div class="title">Not quite yet...</div>'+
                                '<div class="desc">Try again, <span class="btn-skipped">skipped for now</span></div>'+
                                '</div>'+
                            '<i class="fa fa-times msg-close" aria-hidden="true"></i>'+
                        '</div>';
        thiS.find('.view-bottom-msg').remove();
        thiS.append('<div class="view-bottom-msg">'+msgHTML+'</div>');
    }
}

function getQuestionView(object){
    var divCount = -1;
    var questionCount = 0;
    for(var x in object){
        var item = {};
        item.obj = object[x];
        divCount++;
        item.question = {};
        item.question.data = [];
        item.answer = {};
        item.answer.data = [];
        item.hint = {};
        item.hint.data = [];
        item.scheme = {};
        item.scheme.data = [];

        //insert object  into variable
        var question = item.obj.question;
        var answer = item.obj.answer;
        var hint = item.obj.hint;
        var scheme = item.obj.scheme;
        var properties = item.obj.properties;
        var source = item.obj.source;
       
        //generate question obj
        var obj = {};
        obj.dbId = question.id;
        obj.content = '';
        if(question.data==undefined || question.data==null){
            if(question.file!=null){
                obj.content += '<div><img src="'+question.file+'"></div>';
            }
            if(question.question!=null){
                obj.content += question.question;
            }
            item.question.data.push(obj);
        }else{
            item.question.data = question.data;
            for(var x in item.question.data){
                item.question.data[x].dbId = question.id;
                item.question.data[x].seq = null;
            }
        }
        // if(question.content!=null){
        //     obj.content += question.content;
        // }

        if(properties.instrument.item.type=='mcq'){
            for(var y in answer){
                var a = answer[y];
                var obj = {};
                obj.dbId = a.id;
                obj.content = '';
                obj.assign = false;
                obj.descriptionList = [];
                if(a.file!=null){
                    obj.content += '<div><img src="'+a.file+'"></div>';
                }
                if(a.answer_option!=null){
                    obj.content += a.answer_option;
                }
                if(a.content!=null){
                    obj.content += a.content;
                }
                if(a.is_correct_answer=='1'){
                    obj.assign = true;
                }
                var obj2 = {};
                obj2.content = '';
                for(var y in a.descriptionList){
                    var d = a.descriptionList[y];
                    if(d.file!=null){
                        obj2.content += '<div><img src="'+d.file+'"></div>';
                    }
                    if(d.text!=null){
                        obj2.content += d.text;
                    }
                    if(d.content!=null){
                        obj.descriptionList = a.descriptionList;
                    }else{
                        obj.descriptionList.push(obj2);
                    }
                } 
                item.answer.data.push(obj);
            }  
        }

        if(properties.instrument.item.type=='isi_tempat_kosong'){
            for(var y in answer){
                var a = answer[y];
                var obj = {};
                obj.dbId = a.id;
                obj.content = '';
                obj.assign = a.assign;
                obj.descriptionList = [];
                if(a.file!=null){
                    obj.content += '<div><img src="'+a.file+'"></div>';
                }
                if(a.answer_option!=null){
                    obj.content += a.answer_option;
                }
                if(a.content!=null){
                    obj.content += a.content;
                }
                var obj2 = {};
                obj2.content = '';
                for(var y in a.descriptionList){
                    var d = a.descriptionList[y];
                    if(d.file!=null){
                        obj2.content += '<div><img src="'+d.file+'"></div>';
                    }
                    if(d.text!=null){
                        obj2.content += d.text;
                    }
                    if(d.content!=null){
                        obj.descriptionList = a.descriptionList;
                    }else{
                        obj.descriptionList.push(obj2);
                    }
                } 
                for(var y in a.answerList){
                    var d = a.answerList[y];
                    if(d.content!=null){
                        obj.answerList = a.answerList;
                    }
                } 
                item.answer.data.push(obj);
            }  
        }

        if(properties.instrument.item.type=='benar_palsu' || properties.instrument.item.type=='susun_semula' || properties.instrument.item.type=='pengelasan'){
            for(var y in answer){
                var a = answer[y];
                var obj = {};
                obj.dbId = a.id;
                obj.content = '';
                obj.assign = a.assign;
                obj.descriptionList = [];
                if(a.file!=null){
                    obj.content += '<div><img src="'+a.file+'"></div>';
                }
                if(a.answer_option!=null){
                    obj.content += a.answer_option;
                }
                if(a.content!=null){
                    obj.content += a.content;
                }
                var obj2 = {};
                obj2.content = '';
                for(var y in a.descriptionList){
                    var d = a.descriptionList[y];
                    if(d.file!=null){
                        obj2.content += '<div><img src="'+d.file+'"></div>';
                    }
                    if(d.text!=null){
                        obj2.content += d.text;
                    }
                    if(d.content!=null){
                        obj.descriptionList = a.descriptionList;
                    }else{
                        obj.descriptionList.push(obj2);
                    }
                } 
                item.answer.data.push(obj);
            }  
        }

        if(properties.instrument.item.type=='padanan'){
            for(var y in answer){
                var a = answer[y];
                var obj = {};
                obj.dbId = a.id;
                obj.content = '';
                obj.assign = a.assign;
                obj.descriptionList = [];
                if(a.file!=null){
                    obj.content += '<div><img src="'+a.file+'"></div>';
                }
                if(a.answer_option!=null){
                    obj.content += a.answer_option;
                }
                if(a.content!=null){
                    obj.content = a.content;
                }
                var obj2 = {};
                obj2.content = '';
                for(var y in a.descriptionList){
                    var d = a.descriptionList[y];
                    if(d.file!=null){
                        obj2.content += '<div><img src="'+d.file+'"></div>';
                    }
                    if(d.text!=null){
                        obj2.content += d.text;
                    }
                    if(d.content!=null){
                        obj.descriptionList = a.descriptionList;
                    }else{
                        obj.descriptionList.push(obj2);
                    }
                } 
                item.answer.data.push(obj);
            }  
        }

        if(properties.instrument.item.type=='subjective'){
            var a = scheme;
            var obj = {};
            obj.dbId = a.id;
            obj.content = '';
            obj.assign = false;
            obj.descriptionList = [];
            if(a.file!=null){
                obj.content += '<div><img src="'+a.file+'"></div>';
            }
            if(a.text!=null){
                obj.content += a.text;
            }
            if(a.content!=null){
                obj.content += a.content;
            }
            var obj2 = {};
            obj2.content = '';
            for(var y in a.descriptionList){
                var d = a.descriptionList[y];
                if(d.file!=null){
                    obj2.content += '<div><img src="'+d.file+'"></div>';
                }
                if(d.text!=null){
                    obj2.content += d.text;
                }
                if(d.content!=null){
                    obj.descriptionList = a.descriptionList;
                }else{
                    obj.descriptionList.push(obj2);
                }
            } 
            item.scheme.data.push(obj);
        }
        
        var obj = {};
        obj.dbId = hint.id;
        obj.content = '';
        if(hint.file!=null){
            obj.content += '<div><img src="'+hint.file+'"></div>';
        }
        if(hint.text!=null){
            obj.content += hint.text;
        }
        if(hint!=null){
            item.hint.data = hint;
        }else{
            item.hint.data.push(obj);
        }
        console.log(obj);
                
        item.type = properties.instrument.item.type;

        var current = '';

        item.isParent = false;
        var contentHTML = '<div style="width:100%;" class="question-content"></div>';
        var assetHTML = '<div style="width:150px;padding-top: 10px;" class="question-asset">{assetHTML}</div>';

        var cIcon = '';
        var cName = '';
        for(var c in difficulty){
            if(difficulty[c].id== properties.competency_level){
                cName = difficulty[c].name;
                cIcon = difficulty[c].icon;
            }
        } 

        //create asset view
        var html = '';
            html+=     '<div class="group-asset">'+
                          '<div style="font-size:12px;color: #666;font-weight:bold;">'+question.code+'</div>'+
                       '</div>';   
        if(properties.type==null || properties.type.toLowerCase()!='parent'){
            html+=     '<div class="group-asset">'+
                            '<div class="td-icon-item" style="justify-content:end; display: inline-flex;">'+
                                '<div class="tdi-icon" style="background:#fff;">'+
                                    '<img src="http://cloudhub.my/app/simpana/img/competency_level/'+cIcon+'" style="width:100%;">'+
                                '</div>'+
                                '<div class="tdi-text">'+cName+'</div>'+
                            '</div>'+
                        '</div>';
        }
        if(properties.type==null || properties.type.toLowerCase()=='parent'){
            html+=      '<div class="group-asset">'+
                            '<div class="td-icon-item" style="justify-content:end;display: inline-flex;">'+
                                '<div style="border: solid 1px #428cc6;padding: 4px;background:#fff;">';
                                 if(source.type.toLowerCase()=='pelangi'){
            html+=                   '<img src="http://cloudhub.my/app/simpana/img/logo/contributor/pelangi.png" style="height:110px;">';
                                 }else if(source.type.toLowerCase()=='learn2score'){
            html+=                   '<img src="https://hometutor.com.my/wp-content/uploads/2017/05/l2s.png" alt="new_logo" class="alignnone size-full wp-image-144" style="height: 100%;">';
                                 }
            html+=               '</div>'+
                             '</div>'+
                       '</div>';
        }
        assetHTML = assetHTML.replace('{assetHTML}', html);

        var skippedState = 0;

        //create question view
        var container1 = '#questionView';
        var container2 = '#queDetailGridContent';
        if(properties.category.toLowerCase()=='multiple'){
            $(container1).append('<div data-id="'+question.id+'" data-type="'+item.type+'"  data-index="'+divCount+'" class="question-group question-group-'+divCount+' '+current+'"></div>');
            if(properties.type.toLowerCase()=='parent'){
                item.isParent = true;
                $(container1).find('.question-group-'+divCount).addClass('item-left');
                $(container1).find('.question-group-'+divCount).append(contentHTML);
                $(container1).find('.question-group-'+divCount+' .question-content').smartQuestion({
                    obj : item
                });
            }else{
                questionCount++;
                var noHTML = '<div style="width:30px;padding: 10px 5px;" class="question-no">'+questionCount+'</div>';
                $(container1).find('.question-group-'+divCount).addClass('item-left');
                $(container1).find('.question-group-'+divCount).append(tpl.ht);
                $(container1).find('.question-group-'+divCount+' .ht-group.content').addClass('item-left').append(noHTML+contentHTML);
                //createPreview($(container1).find('.question-group-'+divCount+' .question-content'), item, 'answer');
                $(container1).find('.question-group-'+divCount+' .question-content').smartQuestion({
                   obj : item
                });
                if($(container1+' .question-group-'+divCount+' .question-content .answer-editor').html()!=undefined){
                    addEditorType('default',container1+' .question-group-'+divCount+' .question-content .answer-editor');
                }
                $(container1).find('.question-group-'+divCount+' .question-content').append('<button style="float:right;" class="btn-check btn btn-primary"><span data-skippedstate="'+skippedState+'" class="data"></span>Check Answer</button>');
                $(container1).find('.question-group-'+divCount+' .question-content').css('margin-bottom','40px');
            }          
        }else{
            $(container1).append('<div data-id="'+question.id+'" data-type="'+item.type+'"  data-index="'+divCount+'"  class="question-group question-group-'+divCount+'"></div>');
             $(container1).find('.question-group-'+divCount).addClass('item-left');
             $(container1).find('.question-group-'+divCount).append(tpl.ht);
             $(container1).find('.question-group-'+divCount+' .ht-group.content').addClass('item-left').append(contentHTML);
             $(container1).find('.question-group-'+divCount+' .question-content').smartQuestion({
                obj : item
             });
            if($(container1+' .question-group-'+divCount+' .question-content .answer-editor').html()!=undefined){
                addEditorType('default',container1+' .question-group-'+divCount+' .question-content .answer-editor');
            } 
            $(container1).find('.question-group-'+divCount+' .question-content').append('<button style="float:right;" class="btn-check btn btn-primary"><span data-skippedstate="'+skippedState+'" class="data"></span>Check Answer</button>');
            $(container1).find('.question-group-'+divCount+' .question-content').css('margin-bottom','40px');
        }

        if(item.type=='susun_semula'){
            setSorting('view-reorder', item.answer.data);
        }
        console.log(item);
        if(bulk.g.questions==undefined){
            bulk.g.questions = [];
        }
        bulk.g.questions.push(item);
    }
    //  var firework =  $('.view-wrapper[data-type="answer"] .question-group .question-content .question-action');
    // getBottomMsg(firework, false);

}

function contentAnalys(content){
    var status = true;
    var data = content;
    if(data==null || data==undefined || data==''){
        status = false;
    }else{
        if(data.indexOf('img')>0){
            status = true;
        }else{
            data = data.replace(/[^a-z0-9\s]/gi, '');
            data = data.replace(/<\/?(?!img)\w*\b[^>]*>/ig, '');
        }  
    }
    if(status==true){
        if(data.trim()==''){
            status = false;
        }
    }
    return status;
}

function setSorting(type, obj){
    if(type=='view-reorder'){
        var count = 0;
        for(var x in obj){
            Sortable.create($(".row-reorder.reorder .tpl-sortable" )[count], {
                animation: 150,
                onEnd: function (/**Event*/evt) {
                //updateAnsReorder($(evt.target));
                }
            });
            count++;
        }
        $('.row-reorder.reorder .tpl-sortable').each(function(){
            var thiS = $(this);
            var id = thiS.data('id');
            for(var x in obj){
                var answerKey = [];
                if(obj[x].dbId==id){
                    thiS.find('li.group').each(function(){
                      answerKey.push($(this).data('id'));
                    });
                    obj[x].answerKey = answerKey;
                    break;
                }
            }
            thiS.randomize('li.group');
        });
        console.log('test');
        console.log(obj);
        //$( ".row-reorder.reorder .tpl-sortable")[count]
    }
}


$.fn.randomize = function(childElem) {
    return this.each(function() {
        var $this = $(this);
        var elems = $this.children(childElem);
  
        elems.sort(function() { return (Math.round(Math.random())-0.5); });  
  
        $this.remove(childElem);  
  
        for(var i=0; i < elems.length; i++)
          $this.append(elems[i]);      
  
    });    
  }

function addEditorType(type, div){
    if(type=='default'){
        tinymce.init({
        selector: div,
        // toolbar: false,
        menu: {
            edit: {title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall'},
            insert: {title: 'Insert', items: 'link media | template hr'},
            view: {title: 'View', items: 'visualaid'},
            format: {title: 'Format', items: 'bold italic underline strikethrough superscript subscript | removeformat'},
            table: {title: 'Table', items: 'inserttable tableprops deletetable | cell row column'},
            tools: {title: 'Tools', items: 'spellchecker code'}
        },
        menubar: '',
        images_dataimg_filter : function(img) {
            return img.hasAttribute('internal-blob');
        },
        plugins: 'powerpaste tiny_mce_wiris',
        toolbar: 'cut,copy,paste,|,search,|,undo,redo,justifyleft,justifycenter,justifyright, |,fullscreen',
        init_instance_callback : "updateFunctionTimeOut",
        powerpaste_allow_local_images: true,
        powerpaste_word_import: 'clean',
        powerpaste_html_import: 'clean',
        verify_html: false,
        entity_encoding: 'raw',
        entities: '160,nbsp,38,amp,60,lt,62,gt',
        init_instance_callback: function (editor) {
        editor.on('PastePreProcess', function (e) {
            var html = e.content;
            // div.g.tempContainer.html(html);
            // div.g.tempContainer.find('p').each(function(){
            // var p = $(this);
            // var content = p.html();
            //   content = content.replace(/&nbsp;/g,"");
            //   //console.log(content);
            //    if(content.trim()==''){
            //     p.remove();
            //    }
            // });
            // html = div.g.tempContainer.html();
            // e.content = html;

        });
        },
        content_css: "../library/tinymce/newstyle.css"
        });
    }
    if(type=='matheditor'){
        tinymce.init({
        selector: div,
        // toolbar: false,
        menu: {
            edit: {title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall'},
            insert: {title: 'Insert', items: 'link media | template hr'},
            view: {title: 'View', items: 'visualaid'},
            format: {title: 'Format', items: 'bold italic underline strikethrough superscript subscript | removeformat'},
            table: {title: 'Table', items: 'inserttable tableprops deletetable | cell row column'},
            tools: {title: 'Tools', items: 'spellchecker code'}
        },
        menubar: 'edit format',
        images_dataimg_filter : function(img) {
            return img.hasAttribute('internal-blob');
        },
        plugins: 'powerpaste tiny_mce_wiris',
        toolbar: 'cut,copy,paste,|,search,|,undo,redo,justifyleft,justifycenter,justifyright, |,tiny_mce_wiris_formulaEditor,tiny_mce_wiris_formulaEditorChemistry,|,fullscreen',
        init_instance_callback : "updateFunctionTimeOut",
        powerpaste_allow_local_images: true,
        powerpaste_word_import: 'clean',
        powerpaste_html_import: 'clean',
        verify_html: false,
        entity_encoding: 'raw',
        entities: '160,nbsp,38,amp,60,lt,62,gt',
        init_instance_callback: function (editor) {
        editor.on('PastePreProcess', function (e) {
            var html = e.content;
            // div.g.tempContainer.html(html);
            // div.g.tempContainer.find('p').each(function(){
            // var p = $(this);
            // var content = p.html();
            //   content = content.replace(/&nbsp;/g,"");
            //   //console.log(content);
            //    if(content.trim()==''){
            //     p.remove();
            //    }
            // });
            // html = div.g.tempContainer.html();
            // e.content = html;

        });
        },
        content_css: "../library/tinymce/newstyle.css"
        });
    }
    if(type=='sketchboard'){
        LC.setDefaultImageURLPrefix('../library/literallycanvas/img');
        var id = $('.textarea:visible').data('class');
        id = id+'-textarea';
        //alert(id);
        var container = document.getElementsByClassName(id)[0];
        cr.sketchEditor = LC.init(container, {imageSize: {width: null, height: null}});
    }

    if(type=='editquestion'){
        tinymce.init({
        selector: div,
        // toolbar: false,
        menu: {
            edit: {title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall'},
            insert: {title: 'Insert', items: 'link media | template hr'},
            view: {title: 'View', items: 'visualaid'},
            format: {title: 'Format', items: 'bold italic underline strikethrough superscript subscript | removeformat'},
            table: {title: 'Table', items: 'inserttable tableprops deletetable | cell row column'},
            tools: {title: 'Tools', items: 'spellchecker code'}
        },
        menubar: 'edit format',
        images_dataimg_filter : function(img) {
            return img.hasAttribute('internal-blob');
        },
        plugins: 'powerpaste tiny_mce_wiris',
        toolbar: 'bold,italic,underline,|,cut,copy,paste,|,search,|,undo,redo,|,forecolor,backcolor,|,justifyleft,justifycenter,justifyright,fontsizeselect,|,tiny_mce_wiris_formulaEditor,tiny_mce_wiris_formulaEditorChemistry,|,fullscreen',
        init_instance_callback : "updateFunctionTimeOut",
        powerpaste_allow_local_images: true,
        powerpaste_word_import: 'clean',
        powerpaste_html_import: 'clean',
        verify_html: false,
        entity_encoding: 'raw',
        entities: '160,nbsp,38,amp,60,lt,62,gt',
        init_instance_callback: function (editor) {
        editor.on('PastePreProcess', function (e) {
            var html = e.content;
            // console.log(div.g.tempContainer);
            // div.g.tempContainer.html(html);
            // div.g.tempContainer.find('p').each(function(){
            // var p = $(this);
            // var content = p.html();
            //   content = content.replace(/&nbsp;/g,"");
            //   //console.log(content);
            //   if(content.trim()==''){
            //     p.remove();
            //   }
            // });
            // html = div.g.tempContainer.html();
            // e.content = html;

        });
        },
        content_css: "../../../../library/tinymce/newstyle.css"
        });
    }
}
