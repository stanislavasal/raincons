(function () {
  // create notification div
  let notification = document.createElement('div');
  document.body.appendChild(notification)
  notification.setAttribute("style", `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translate(-50%, 0%);

      padding: 5px 15px;
      font-size: 14px;
      
      border-radius: 80px;

      background: rgb(0, 0, 0);
      color: white;

      display: flex;
      align-items: center;
      justify-content: center;

      transition: 0.3s;
      opacity: 0.0;
    `)
  // notification appear/disappear timeoutID
  let notificationAppearTimeoutID = null

  // load jquery js
  let script = document.createElement("SCRIPT")
  script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js'
  script.type = 'text/javascript'
  document.getElementsByTagName("head")[0].appendChild(script)

  // poll for jQuery to come into existence
  let checkReady = function (callback) {
    if (window.jQuery) {
      callback(jQuery)
    } else {
      window.setTimeout(function () { checkReady(callback) }, 20)
    }
  }

  // start polling...
  checkReady(function ($) {
    $(function () {
      /*
      *********************************************** 1. Now JQuery is loaded ********************************************************
      *********************************************** 2. Fetch the svg icons from /icons folder **************************************
      *********************************************** 3. This is for the GitHub Page using api.github.com/repos/... ******************
      */
      // variables for whole icon category/icons
      let iconCategories = ['uncategorized']
      let iconsInCategory = {
        'uncategorized': []
      }

      // main fetch function for gh pages
      const fetchSVGIcons = async () => {
        // find the /icons folder from the main repository
        const repositoryUrl = `https://api.github.com/repos/rnbwdev/raincons/git/trees/main`
        const repositoryContent = await fetch(repositoryUrl).then(res => res.json())
        const iconsFolderObj = repositoryContent.tree.find(node => node.path === 'icons')

        // if /icons folder is found, get all of icon-category/icons
        if (iconsFolderObj) {
          const iconsFolderContent = await fetch(iconsFolderObj.url).then(res => res.json())
          iconsFolderContent.tree.forEach(node => {
            if (node.path.includes('.')) { // when it's not the icon-category folder
              // get only valid uncategorized icons
              if (node.path.search('.svg') != -1) {
                iconsInCategory['uncategorized'].push(node.path.substring(0, node.path.length - 4))
              }
            } else { // this is the case for icon-category folder
              // save the category
              iconCategories.push(node.path)
            }
          })
          await Promise.all(iconCategories.map(async (category) => {
            // get the icons inside the category folder
            iconsInCategory[category.path] = []
            console.log(1)
            const iconCategoryFolderContent = await fetch(category.url).then(res => res.json())
            iconCategoryFolderContent.tree.forEach(node => {
              console.log(2)
              // only get the valid svg icons
              if (node.path.search('.svg') != -1) {
                iconsInCategory[category.path].push(node.path.substring(0, node.path.length - 4))
              }
            })
          })).then(() => {
            console.log(3)
          })

          console.log(4)

          // if it has no uncategorized icon, remove the category from the list 
          if (iconsInCategory['uncategorized'].length == 0) {
            iconCategories.shift()
          }

          // build the content html for the icon-categories/icons
          let contentHtml = ``
          iconCategories.forEach(category => {
            // build html for the category section
            contentHtml += `
              <div class="gap-m direction-row">
                <!-- Category Label -->
                <div>
                  <h5 style="text-transform: capitalize;" id="${category}" class="category-label">${category}</h5>
                </div>
    
                <!-- SVGIcons -->
                <div class="gap-l box-l">`

            iconsInCategory[category].forEach(icon => {
              contentHtml += `
                  <svg-icon class="${category}-icon">${category}/${icon}</svg-icon>
                `
            })

            contentHtml += `
                </div>
              </div>
              `
          })

          // append the built html to the #content
          $('#content').append(contentHtml)

          // add event handlers after html page is completed
          // filter when keyboard is released
          $('#searchInput').on('keyup', function (event) {
            // display CSS constants
            const NONE = 'none'
            const BLOCK = 'block'

            // variables
            let total_icons = document.getElementsByTagName('svg-icon')
            let search_content = $(this).val()

            if (search_content === '') {
              // show all icons
              for (let i = 0; i < total_icons.length; i++) {
                $(total_icons[i]).css('display', BLOCK)
              }
            } else {
              // show matched icons except .post-icon
              for (let i = 0; i < total_icons.length; i++) {
                if ($(total_icons[i]).hasClass('post-icon')) {
                  continue
                }
                let item = total_icons[i].innerHTML
                if (item.search(search_content) == -1) {
                  $(total_icons[i]).css('display', NONE)
                } else {
                  $(total_icons[i]).css('display', BLOCK)
                }
              }
            }

            // remove .category-label including no svg-icon
            $('.category-label').each(function () {
              let categoryId = $(this)[0].id + '-icon'
              let flag = false
              $(document).find(`svg-icon.${categoryId}`).each(function (index, icon) {
                if ($(icon).css('display') == BLOCK) {
                  flag = true
                }
              })

              if (!flag) {
                $(this).parent().parent().css('display', NONE)
              } else {
                $(this).parent().parent().css('display', BLOCK)
              }
            })
          })

          // copy svg-icon iconName to clipboard on clicking 
          $('svg-icon:not(.post-icon)').click(function () {
            // get iconName from svg-icon
            let iconName = $(this)[0].innerHTML
            let iconHtml = `<svg-icon>${iconName}</svg-icon>`

            // copy iconName to clipboard
            let dummy = document.createElement("textarea")
            document.body.appendChild(dummy)
            dummy.value = iconHtml
            dummy.select()
            document.execCommand("copy")
            document.body.removeChild(dummy)

            // show notification
            clearTimeout(notificationAppearTimeoutID)
            $(notification).css('opacity', '1.0')
            notification.innerHTML = `Copied - &lt;svg-icon&gt;${iconName}&lt;/svg-icon&gt;`

            // hide notification after 3s delay
            notificationAppearTimeoutID = setTimeout(() => {
              $(notification).css('opacity', '0.0')
            }, 3 * 1000)
          })
        }
      }
      fetchSVGIcons()



      /*
      *********************************************** 1. Now JQuery is loaded ********************************************************
      *********************************************** 2. Fetch the svg icons from /icons folder **************************************
      *********************************************** 3. This is for the Host Server except GitHub Page ******************************
      */
      /* // get current icons.html href
      let iconsHtmlHref = window.location.href

      // get /icons directory url
      let hArr = iconsHtmlHref.split('/')
      hArr.pop()
      let iconsDirUrl = hArr.join('/')
      // main Fetch function
      const fetchSVGIcons = async () => {
        // get /icons directory structure html
        let categoryHtml = await $.ajax({
          url: iconsDirUrl,
          type: 'GET',
        })
        // get /icons/category code part from the /icons directory html
        let categoryATagList = $(categoryHtml).find('a')
        let uncategorized = []
        let uncategorizedHtml = ``
        let categorySectionHtml = ''
        for (let i = 0; i < categoryATagList.length; i++) {
          // get a tag's innerHTML and href attr
          let a_href = $(categoryATagList[i]).attr('href')
          let a_content = $(categoryATagList[i])[0].innerHTML
          // if  does not contain innerHTML or does contain '.', continue.
          if (a_href.search(a_content) == -1 || a_content.includes('.')) {
            if (a_content.search('.svg') != -1) {
              uncategorized.push(a_content.substring(0, a_content.length - 4))
            }
            continue
          }
          let categoryName = a_content
          // categoryName = categoryName.substring(0, categoryName.length - 1)
          categoryName = categoryName.replace(/\//, "")
          // get /icons/category directory url
          let iconCategoryDirUrl = iconsDirUrl + "/" + categoryName

          // get /icons/category directory structure html
          let iconsHtml = await $.ajax({
            url: iconCategoryDirUrl,
            type: 'GET',
          })

          // get /icons/category/icon-name code part from the /icons/category directory html
          let iconATagList = $(iconsHtml).find('a')
          let svgIconNames = []
          for (let i = 0; i < iconATagList.length; i++) {
            // get a tag's innerHTML and href attr
            let sub_a_href = $(iconATagList[i]).attr('href')
            let sub_a_content = $(iconATagList[i])[0].innerHTML
            // if innerHTML does contain '.svg' or href does not contain innerHTML, continue.
            if (sub_a_href.search(sub_a_content) == -1 || sub_a_href.search('.svg') == -1) {
              continue
            }
            let iconName = sub_a_content
            iconName = iconName.substring(0, iconName.length - 4)
            svgIconNames.push(iconName)
          }

          // build html for the category section
          categorySectionHtml += `
            <div class="gap-m direction-row">
              <!-- Category Label -->
              <div>
                <h5 style="text-transform: capitalize;" id="${categoryName}" class="category-label">${categoryName}</h5>
              </div>

              <!-- SVGIcons -->
              <div class="gap-l box-l">`
          for (let svgIconName of svgIconNames) {
            categorySectionHtml += `
                <svg-icon class="${categoryName}-icon">${categoryName}/${svgIconName}</svg-icon>
              `
          }
          categorySectionHtml += `
              </div>
            </div>
          `
        }
        // append uncategorized svg-icons
        if (uncategorized.length > 0) {
          let categoryName = 'Uncategorized'
          uncategorizedHtml = `
            <div class="gap-m direction-row">
              <!-- Category Label -->
              <div>
                <h5 id="${categoryName}" class="category-label">${categoryName}</h5>
              </div>

              <!-- SVGIcons -->
              <div class="gap-l box-l">`
          for (let i = 0; i < uncategorized.length; i++) {
            uncategorizedHtml += `
                <svg-icon class="${categoryName}-icon">${uncategorized[i]}</svg-icon>
              `
          }
          uncategorizedHtml += `
              </div>
            </div>
          `
        }
        $('#content').append(uncategorizedHtml + categorySectionHtml)

        // add event handlers after html page is completed
        // filter when keyboard is released
        $('#searchInput').on('keyup', function (event) {
          // display CSS constants
          const NONE = 'none'
          const BLOCK = 'block'

          // variables
          let total_icons = document.getElementsByTagName('svg-icon')
          let search_content = $(this).val()

          if (search_content === '') {
            // show all icons
            for (let i = 0; i < total_icons.length; i++) {
              $(total_icons[i]).css('display', BLOCK)
            }
          } else {
            // show matched icons except .post-icon
            for (let i = 0; i < total_icons.length; i++) {
              if ($(total_icons[i]).hasClass('post-icon')) {
                continue
              }
              let item = total_icons[i].innerHTML
              if (item.search(search_content) == -1) {
                $(total_icons[i]).css('display', NONE)
              } else {
                $(total_icons[i]).css('display', BLOCK)
              }
            }
          }

          // remove .category-label including no svg-icon
          $('.category-label').each(function () {
            let categoryId = $(this)[0].id + '-icon'
            let flag = false
            $(document).find(`svg-icon.${categoryId}`).each(function (index, icon) {
              if ($(icon).css('display') == BLOCK) {
                flag = true
              }
            })

            if (!flag) {
              $(this).parent().parent().css('display', NONE)
            } else {
              $(this).parent().parent().css('display', BLOCK)
            }
          })
        })

        // copy svg-icon iconName to clipboard on clicking 
        $('svg-icon:not(.post-icon)').click(function () {
          // get iconName from svg-icon
          let iconName = $(this)[0].innerHTML
          let iconHtml = `<svg-icon>${iconName}</svg-icon>`

          // copy iconName to clipboard
          let dummy = document.createElement("textarea")
          document.body.appendChild(dummy)
          dummy.value = iconHtml
          dummy.select()
          document.execCommand("copy")
          document.body.removeChild(dummy)

          // show notification
          clearTimeout(notificationAppearTimeoutID)
          $(notification).css('opacity', '1.0')
          notification.innerHTML = `Copied - &lt;svg-icon&gt;${iconName}&lt;/svg-icon&gt;`

          // hide notification after 3s delay
          notificationAppearTimeoutID = setTimeout(() => {
            $(notification).css('opacity', '0.0')
          }, 3 * 1000)
        })
      }
      fetchSVGIcons() */
    })
  })
})()