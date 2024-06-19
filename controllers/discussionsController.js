// controllers/discussionsController.js
"use strict";

const Discussion = require("../models/Discussion"), // 사용자 모델 요청
  getDiscussionParams = (body, discussion) => {
    return {
      title: body.title,
      description: body.description,
      author: discussion,
      category: body.category,
      tags: body.tags,
    };
  };

module.exports = {
  /**
   * =====================================================================
   * C: CREATE / 생성
   * =====================================================================
   */
  // 1. new: 액션,
  create: (req, res, next) => {
    if (req.skip) next(); // 유효성 체크를 통과하지 못하면 다음 미들웨어 함수로 전달

    let discussionParams = getDiscussionParams(req.body, req.discussion);

    Discussion.create(discussionParams)
    .then((discussion)=> {
      res.locals.discussion = discussion;
      res.locals.redirect = "/discussions"; // 사용자 인덱스 페이지로 리디렉션
      next();
    })
    .catch((error)=> {
      res.locals.redirect = "/discussions/new"; // 사용자 생성 페이지로 리디렉션
      next();
    })
  },
  // 3. redirectView: 액션,
  /**
   * =====================================================================
   * R: READ / 조회
   * =====================================================================
   */
  /**
   * ------------------------------------
   * ALL records / 모든 레코드
   * ------------------------------------
   */
  index: (req, res, next) => {
    Discussion.find() // index 액션에서만 퀴리 실행
      .populate("author") // 사용자의 토론을 가져오기 위해 populate 메소드 사용
      .exec()
      .then((discussions) => {
        // 사용자 배열로 index 페이지 렌더링
        res.locals.discussions = discussions; // 응답상에서 사용자 데이터를 저장하고 다음 미들웨어 함수 호출
        next();
      })
      .catch((error) => {
        // 로그 메시지를 출력하고 홈페이지로 리디렉션
        console.log(`Error fetching discussions: ${error.message}`);
        next(error); // 에러를 캐치하고 다음 미들웨어로 전달
      });
  },
  // 5. indexView: 엑션,
  indexView: (req, res) => {
    res.render("discussions/index", {
      page: "discussions",
      title: "All Users",
    }); // 분리된 액션으로 뷰 렌더링
  },

  showView: (req, res) => {
    res.render("discussions/show", {
      page: "discussions",
      title: "All Users",
    }); // 분리된 액션으로 뷰 렌더링
  },


  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },

  delete: (req, res, next) => {
    let discussionId = req.params.id;
    Discussion.findByIdAndRemove(discussionId) // findByIdAndRemove 메소드를 이용한 사용자 삭제
      .then(() => {
        res.locals.redirect = "/discussions";
        next();
      })
      .catch((error) => {
        console.log(`Error deleting discussion by ID: ${error.message}`);
        next();
      });
  },

  new: (req, res) => {
    res.render("discussions/new", {
      page: "new-user",
      title: "New User",
    });
  },
  /**
   * ------------------------------------
   * SINGLE record / 단일 레코드
   * ------------------------------------
   */
  show: (req, res, next) => {
    Discussion.findById(req.params.id)
    .populate("author")
    .populate("comments")
    .then((discussion) => {
      discussion.views++;
      discussion.save();
      // ...
    });
  },
  
  // 7. showView: 액션,
  /**
   * =====================================================================
   * U: UPDATE / 수정
   * =====================================================================
   */
  edit: (req, res, next) => {
    Discussion.findById(req.params.id)
  .populate("author")
  .populate("comments")
  .then((discussion) => {
    // ...
  });
  },

  update: (req, res, next) => {
    let discussionId = req.params.id,
      discussionParams = getDiscussionParams(req.body);

    Discussion.findByIdAndUpdate(discussionId, {
      $set: discussionParams,
    }) //ID로 사용자를 찾아 단일 명령으로 레코드를 수정하기 위한 findByIdAndUpdate의 사용
      .then((discussion) => {
        res.locals.redirect = `/discussions/${discussionId}`;
        res.locals.discussion = discussion;
        next(); // 지역 변수로서 응답하기 위해 사용자를 추가하고 다음 미들웨어 함수 호출
      })
      .catch((error) => {
        console.log(`Error updating discussion by ID: ${error.message}`);
        next(error);
      });
  },
  /**
   * =====================================================================
   * D: DELETE / 삭제
   * =====================================================================
   */
  // 10. delete: 액션,
};