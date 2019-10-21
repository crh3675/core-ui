
/**
 * Create asset collections to be concatenated into a
 * single file.  Collections can be named anything that
 * you choose.
 */
module.exports.assets = {
  collections: {
    scripts: {
      // Root path of where assets reside
      root: '/components/Core/assets',
      // Output location relative to application path
      output: '/public/scripts/core.js',
      // Files to concatenate
      files: [
        '/scripts/espolyfills.js',
        '/vendor/idle/idle-timer.min.js',
        '/vendor/moment/moment-with-locales.min.js',
        '/vendor/moment/moment-timezone.min.js',
        '/vendor/numeral/numeral.min.js',
        '/vendor/promises/promise-6.1.0.min.js',
        '/vendor/promises/promise-done-6.1.0.min.js',
        '/vendor/jqdnr/jquery.dnr.min.js',
        '/vendor/slider/jquery.nouislider-7.0.9.js',
        '/vendor/jquery-mousewheel/jquery.mousewheel.min.js',
        '/vendor/datetime/jquery.datetimepicker.min.js',
        '/vendor/smallipop/jquery.smallipop-0.6.2.js',
        '/vendor/sortable/jquery.sortable-0.9.12.min.js',
        '/vendor/maxar/customInputs.js',
        '/vendor/tablesorter/jquery.tablesorter.min.js',
        '/vendor/tablesorter/jquery.pager.min.js',
        '/vendor/jscrollpane/jquery.jscrollpane.js',
        '/vendor/chosen/chosen.jquery.min.js',
        '/vendor/daterangepicker/daterangepicker.js'
      ]
    },
    styles: {
      root: '/components/Core/assets',
      output: '/public/styles/core.css',
      files: [
        '/styles/reset.css',
        '/styles/clearfix.css',
        '/vendor/maxar/customInputs.css',
        '/vendor/slider/jquery.nouipips.css',
        '/vendor/smallipop/smallipop.css',
        '/vendor/slider/jquery.nouislider.css',
        '/vendor/chosen/chosen.css',
        '/vendor/datetime/datetime.css',
        '/vendor/jscrollpane/jquery.jscrollpane.css',
        '/vendor/bootstrap/bootstrap-glyphicons.css',
        '/vendor/daterangepicker/daterangepicker.css'
      ]
    }
  }
};
