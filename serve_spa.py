from http.server import SimpleHTTPRequestHandler, HTTPServer
import os

class SPAHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # Adjust the path to point to the 'build' directory
        file_path = os.path.join('build', self.path[1:])
        
        # Redirect root to '200.html' or serve the file if it exists
        if self.path == '/' or not os.path.exists(file_path):
            self.path = '/build/200.html'
        else:
            self.path = '/build' + self.path
        
        return super().do_GET()

if __name__ == '__main__':
    # Set the directory where the script is located as the base directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    httpd = HTTPServer(('', 8000), SPAHandler)
    print("Serving SPA on http://localhost:8000")
    httpd.serve_forever()
