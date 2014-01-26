/*
This script is a modified version of the wikis.sun.com Confluence
dashboard spacelist pagination script provided to UIUC by
Sun's Igor Minar.
*/

AJS.toInit(function($) {
  SunDashboard.init();
})

var SunDashboard = {
    
  pagerId: "comSunWikis-dashboard-spacePager",
  currentPageId: "currentPage",

  init: function() {
    AJS.$("table.spaceList").after("<div id='" + this.pagerId + "'></div>");
    var pager = AJS.$("#" + this.pagerId);
    var spaceCount = AJS.$("tr.spaceList").length;
    var pageCount = Math.ceil(spaceCount/20);

    if (pageCount > 1) {
    
        pager.append("<br /><strong>More Spaces:</strong>");
    
        for (var i=1; i<=pageCount; i++) {
            pager.append("&nbsp;<a href='#space-page-" + i + "'>" + i + "</a> ");
        }
    }

    pager.children("a").click(function (e){
        SunDashboard.flipToPage(parseInt(AJS.$(e.target).html()));
        e.preventDefault();
        return false;
    });

    SunDashboard.flipToPage(1);
  },


  /**
   * Paginates spaces listing on the main dashboard
   *
   * @param toPage - used to determine which spaces should be displayed
   */
  flipToPage: function(toPage) {
    var fromPage = this.currentPage();
    if (fromPage != null) {
        AJS.$("tr.spaceList").slice((fromPage-1)*20, fromPage*20).hide();
        AJS.$("#" + this.pagerId + " a[href=#space-page-" + fromPage + "]").css("font-weight","normal");
    }
    
    AJS.$("tr.spaceList").slice((toPage-1)*20, toPage*20).show();
    AJS.$("#" + this.pagerId + " a[href=#space-page-" + toPage + "]").css("font-weight","bold");
    this.setCurrentPage(toPage);
  },


  /**
   * Returns the current page
   */
  currentPage: function() {
      var pager = AJS.$("#" + this.pagerId);
      return pager.data(this.currentPageId);
  },


  /**
   * Updates the current page state
   */
  setCurrentPage: function(currentPage) {
      var pager = AJS.$("#" + this.pagerId);
      pager.data(this.currentPageId, currentPage);
  }
}
