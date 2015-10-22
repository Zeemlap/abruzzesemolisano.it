Redactor is the most fantastic yet beautiful and easy-to-use WYSIWYG editor on jQuery. It is lightning fast, small, scalable, and powerful.

To use this nuget in your projects you must purchase a license first at http://redactorjs.com.

Happy coding!

 --Installation--

 - To install Redactor, place the following code between the <head></head> tags:

    <link rel="stylesheet" href="/js/redactor/redactor.css" />
    <script src="/js/redactor/redactor.js"></script>

 - You can call Redactor using the following code:

    <script type="text/javascript">
    $(document).ready(
    	function()
    	{
    		$('#redactor_content').redactor();
    	}
    );
    </script>
    
    This code may also be placed between the <head></head> tags or at any other place on the page.
    
 - Finally, you need to place a <textarea> element with ID "redactor_content" (or with the ID that you set during Redactor's call). This element will be replaced by the visual representation of the Redactor.

    <textarea id="redactor_content" name="content"></textarea>

 - Gathering everything:
    <!DOCTYPE html>
    <html>
    	<head>
    		<title>Redactor</title>
    		<meta charset="utf-8">
    		
    		<script src="/js/jquery-1.7.min.js"></script>
    		
    		<link rel="stylesheet" href="/js/redactor/redactor.css" />
    		<script src="/js/redactor/redactor.js"></script>
    		
    		<script type="text/javascript">
    		$(document).ready(
    			function()
    			{
    				$('#redactor_content').redactor();
    			}
    		);
    		</script>				
    	</head>
    	<body>
    		<textarea id="redactor_content" name="content"></textarea>
    	</body>
    </html>