
	function lorentz(sigma,rho,beta) {
		this.sigma = sigma;
		this.rho = rho;
		this.beta = beta;
		this.x = 0.01;
		this.y = 0.01;
		this.z = 0.01;
		this.dtmax = 0.015;

		this.ranges = { 'x':{'min':-20.0, 'max':25.0}, 'y':{'min':-40, 'max':40}, 'z':{'min':0, 'max':60} };

		this.set = function(x,y,z) { this.x = x; this.y = y; this.z = z; }
				
		this.dx = function(x) { return this.sigma * (this.y - x); }
		this.dy = function(y) { return this.x * (this.rho - this.z) - y; }
		this.dz = function(z) { return this.x * this.y - this.beta * z; }

		this.chaos = function(perc) {this.rho = 13.0 + (perc * 15.0) / 100.0;}	

	}

	function rossler(a,b,c) {
		this.a = a;
		this.b = b;
		this.c = c;
		this.x = 1.0;
		this.y = 1.0;
		this.z = 1.0;
		this.dtmax = 0.05;

		this.ranges = { 'x':{'min':-20.0, 'max':25.0}, 'y':{'min':-25, 'max':20}, 'z':{'min':-5.0, 'max':110} };

		this.set = function(x,y,z) { this.x = x; this.y = y; this.z = z; }
				
		this.dx = function(x) { return -this.y - this.z; }
		this.dy = function(y) { return this.x + this.a * y; }
		this.dz = function(z) { return this.b + z * (this.x - this.c); }

		this.chaos = function(perc) {this.c = 5.7 + (perc * 8.3) / 100.0;}	

	}

	// http://protenniscampscom.nationprotect.net/HomoclinicTangles/Publications/Generalizations.pdf
		function chua(alpha,beta) {
		this.alpha = alpha;
		this.beta = beta;
		this.x = 0.1;
		this.y = 0.1;
		this.z = 0.1;
		this.dtmax = 0.02;

		this.ranges = { 'x':{'min':-3.0, 'max':3.0}, 'y':{'min':-0.5, 'max':0.5}, 'z':{'min':-5.0, 'max':5.0} };

		this.set = function(x,y,z) { this.x = x; this.y = y; this.z = z; }
				
		this.f = function(h) {return -0.7142857142857143*h+(-0.21428571428571425)*(Math.abs(h+1)-Math.abs(h-1));}
				
		this.dx = function(x) { return this.alpha * (this.y - x - this.f(x)); }
		this.dy = function(y) { return this.x - y + this.z; }
		this.dz = function(z) { return -this.beta * this.y ; }

		this.chaos = function(perc) {this.beta = 25 + ((100-perc) * 25.0) / 100.0;}	

	}

	function fabrab(alpha,gamma) {
		this.alpha = alpha;
		this.gamma = gamma;
				
		this.x = 0.1;
		this.y = 0.1;
		this.z = 0.1;
		this.dtmax = 0.08;
				
		this.ranges = { 'x':{'min':-2.0, 'max':2.0}, 'y':{'min':-3.0, 'max':3.0}, 'z':{'min':-0.1, 'max':2.0} };
			
		this.set = function(x,y,z) { this.x = x; this.y = y; this.z = z; }
				
		this.dx = function(x) {return this.y*(this.z - 1 + x*x) + this.gamma*x;}
		this.dy = function(y) {return this.x*(3*this.z + 1 -this.x*this.x) + this.gamma*y}
		this.dz = function(z) {return -2*z*(this.alpha + this.x*this.y);}
				
		this.chaos = function(perc) {this.alpha = 0.14 + (perc*1.1) / 100.0; }
				
	}
			
	function rk4(attract,dt) {
							
		function doRK(v,f) {
					
			var k1 = dt * attract[f](v);
			var k2 = dt * attract[f](v + k1/2.0);
			var k3 = dt * attract[f](v + k2/2.0);
			var k4 = dt * attract[f](v + k3);
								
			return v + (0.5 * k1 + k2 + k3 + 0.5 * k4) / 3.0;
		}	
					
		var x = doRK(attract.x,'dx');
		var y = doRK(attract.y,'dy');
		var z = doRK(attract.z,'dz');
				
		attract.set(x, y, z);
			
		return attract;
	}	
