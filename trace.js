	function trace(target,attract,context) {
				
		this.setPlane = function(xplane,yplane) {
			this.xvar = xplane;
			this.yvar = yplane;
			var xrange = this.attractor.ranges[xplane];
			var yrange = this.attractor.ranges[yplane];
			this.xscale = this.width / (xrange.max - xrange.min);
			this.yscale = this.height / (yrange.max - yrange.min);
			this.xmin = xrange.min;
			this.ymin = yrange.min;
					
			this.xnorm = xrange.max - xrange.min;
			this.ynorm = yrange.max - yrange.min;
		}	
				
		this.setScales = function() {
			var lfrange = this.attractor.ranges[this.lfvar];
			this.lfmin = lfrange.min;
			this.lfnorm = lfrange.max - lfrange.min;

			var rfrange = this.attractor.ranges[this.rfvar];
			this.rfmin = rfrange.min;
			this.rfnorm = rfrange.max - rfrange.min;
				
			var lmrange = this.attractor.ranges[this.lmvar];
			this.lmmin = lmrange.min;
			this.lmnorm = lmrange.max - lmrange.min;
					
			var rmrange = this.attractor.ranges[this.rmvar];
			this.rmmin = rmrange.min;
			this.rmnorm = rmrange.max - rmrange.min;
					
			var balrange = this.attractor.ranges[this.balancevar];
			this.balmin = balrange.min;
			this.balnorm = balrange.max - balrange.min;
		}	
				
		this.getPoint = function() {
				
			this.attractor = rk4(this.attractor,this.dt);
					
			var x = Math.round((this.attractor[this.xvar] - this.xmin) * this.xscale);
			var y = this.height - Math.round((this.attractor[this.yvar] - this.ymin) * this.yscale);
			
			return(x+" "+y);
				
		}	
				
		this.audioTick = function() {
				
			this.points = this.points.replace(/[\d]+\s[\d]+\s/,"");
			this.points += " "+this.getPoint();
			this.pline.setAttribute("points",this.points);
					
			this.leftOsc.frequency.value = this.leftFreqRange * (this.attractor[this.lfvar] - this.lfmin) / this.lfnorm;
			this.leftModOsc.frequency.value = this.leftModRange * (this.attractor[this.lmvar] - this.lmmin) / this.lmnorm;
					
			this.rightOsc.frequency.value = this.rightFreqRange * (this.attractor[this.rfvar] - this.rfmin) / this.rfnorm;
			this.rightModOsc.frequency.value = this.rightModRange * (this.attractor[this.rmvar] - this.rmmin) / this.rmnorm;					
					
			if (this.dynamicbalance) {
				this.leftGain.gain.value = this.maxGain * (1 - (this.attractor[this.balancevar] - this.balmin)/this.balnorm);		
				this.rightGain.gain.value = this.maxGain * (this.attractor[this.balancevar] - this.balmin)/this.balnorm;
			}
		}	
			
		this.quietTick = function() {
			this.points = this.points.replace(/[\d]+\s[\d]+\s/,"");
			this.points += " "+this.getPoint();
			this.pline.setAttribute("points",this.points);
		}
			
		this.initPoints = function() {
			var firstPoint = this.getPoint();
			this.points = firstPoint;
			for (var i=0;i<1024;i++) {
				this.points += " "+firstPoint;
			}						
		}	
						
		this.newPlane = function(x,y) {	
			this.setPlane(x,y);
			this.initPoints();
		}
				
		this.setChaos = function() {
			var val = $("#chaosSlide").slider("value");
			this.attractor.chaos(val);
		}

		this.setSpeed = function() {
			var val = $("#timeSlide").slider("value");
			this.dt = 0.00001 + (this.attractor.dtmax * val) / 100.0;
		}
				
		this.setLeftFreqRange = function() {
			var val = $("#leftFreqRangeSlide").slider("value") / 100.0;
			this.leftFreqRange = Math.floor(val * 1000);	
		}

		this.setLeftModRange = function() {
			var val = $("#leftModRangeSlide").slider("value") / 100.0;
			this.leftModRange = Math.floor(val * 500);
		}
				
		this.setRightFreqRange = function() {
			var val = $("#rightFreqRangeSlide").slider("value") / 100.0;
			this.rightFreqRange = Math.floor(val * 1000);	
		}

		this.setRightModRange = function() {
			var val = $("#rightModRangeSlide").slider("value") / 100.0;
			this.rightModRange = Math.floor(val * 500);
		}

		this.stopLeftModulation = function() {
			this.leftModOsc.disconnect();
			this.leftModGain.disconnect();
			this.leftModulation = false;
		}	

		this.stopRightModulation = function() {
			this.rightModOsc.disconnect();
			this.rightModGain.disconnect();
			this.rightModulation = false;
		}

		this.setVol = function() {
			var val = $("#volSlide").slider("value") / 100.0;
			this.maxGain = val * 8;
			this.monoGain.gain.value = this.maxGain;
					
			if (!this.dynamicbalance) {
				this.leftGain.gain.value = 0.5 * this.maxGain;
				this.rightGain.gain.value = 0.5 * this.maxGain;	
			}	
					
		}
				
		this.setLeftChannel = function() {
			this.mixer.disconnect();
			this.rightOsc.disconnect();
			this.leftOsc.connect(this.monoGain);
			this.monoGain.connect(this.context.destination);
		}
				
		this.setRightChannel = function() {
			this.mixer.disconnect();
			this.leftOsc.disconnect();
			this.rightOsc.connect(this.monoGain);
			this.monoGain.connect(this.context.destination);
		}				
				
		this.setStereo = function() {
					
			this.leftOsc.disconnect();
			this.rightOsc.disconnect();
			this.monoGain.disconnect();
					
			this.leftOsc.connect(this.leftGain);
			this.rightOsc.connect(this.rightGain);

			this.leftGain.connect(this.mixer,0,0);
			this.rightGain.connect(this.mixer,0,1);
					
			this.mixer.connect(this.context.destination);
		}	
				
		this.setVar = function(whichVar,value) {
				
			switch(whichVar) {
				case 'lfv': this.lfvar = value; break;
				case 'lmv': this.lmvar = value;
				if (!this.leftModulation) {
					this.leftModOsc.connect(this.leftModGain);
					this.leftModGain.connect(this.leftOsc.frequency);
					this.leftModulation = true;
				}						
				break;

				case 'rfv': this.rfvar = value; break;
				case 'rmv': this.rmvar = value;
				if (!this.rightModulation) {
					this.rightModOsc.connect(this.rightModGain);
					this.rightModGain.connect(this.rightOsc.frequency);
					this.rightModulation = true;
				}							
				break;

				case 'balancevar': this.balancevar = value; this.dynamicbalance=true; break;
				case 'nobalance': this.dynamicbalance = false;
				this.leftGain.gain.value = this.maxGain * 0.5;
				this.rightGain.gain.value = this.maxGain * 0.5;
				break;
			}	
					
			this.setScales();
					
		}	

		this.init = function() {
		
			this.setSpeed();
			this.setChaos();
			
			if (this.context) {
				this.setVol();
	
				this.setLeftFreqRange();
				this.setLeftModRange();
			
				this.setRightFreqRange();
				this.setRightModRange();
			}
		}

		this.setAttractor = function(attract) {
			this.attractor = attract;
										
			var xp = this.xvar;
			var yp = this.yvar;
					
			this.init();
					
			this.newPlane(xp,yp);
		}	
				
		this.dt = 0.01;

		this.context = context;

		this.attractor = attract;
								
		this.svg = $('#'+target)[0];
		this.width = this.svg.getAttribute("width");
		this.height = this.svg.getAttribute("height");
								
		this.xvar = 'x';
		this.yvar = 'z';
		this.xscale = 1.0;
		this.yscale = 1.0;
				
		this.setPlane('x','z');
					
		this.initPoints();
				
		this.pline = document.createElementNS("http://www.w3.org/2000/svg","polyline");
		this.pline.setAttribute("stroke","#00FF88");
		this.pline.setAttribute("stroke-width","2");
		this.pline.setAttribute("fill","none");
				
		this.pline.setAttribute("points",this.points);
				
		this.svg.appendChild(this.pline);

		if (this.context) {
			this.tick = this.audioTick;
					
			this.leftModulation = true;
			this.rightModulation = true;
				
			this.leftFreqRange = 1000;
			this.leftModRange = 50;

			this.rightFreqRange = 1000;
			this.rightModRange = 50;

			this.context.destination.channelCount = 2;
			
			this.context.destination.channelCountMode = "explicit";
			this.context.destination.channelInterpretation = "discrete";
								
			this.mixer = this.context.createChannelMerger(2);
				
			this.leftOsc = this.context.createOscillator();
			this.leftGain = this.context.createGainNode();
			this.leftModOsc = this.context.createOscillator();
			this.leftModGain = this.context.createGainNode();

			this.monoGain = this.context.createGainNode();

			this.rightOsc = this.context.createOscillator();
			this.rightGain = this.context.createGainNode();
			this.rightModOsc = this.context.createOscillator();
			this.rightModGain = this.context.createGainNode();

			this.maxGain = 2.0;
								
			this.leftModGain.gain.value = 20.0;
			this.leftOsc.type = 0;
			this.leftOsc.frequency.value = 1000;
									
			this.rightModGain.gain.value = 20.0;
			this.rightOsc.type = 0;
			this.rightOsc.frequency.value = 1000;									
							
			this.leftGain.gain.value = this.maxGain;			
			this.rightGain.gain.value = this.maxGain;					
			this.monoGain.gain.value = this.maxGain;			
						
			this.leftModOsc.connect(this.leftModGain);
			this.leftModGain.connect(this.leftOsc.frequency);

			this.rightModOsc.connect(this.rightModGain);
			this.rightModGain.connect(this.rightOsc.frequency);

			this.leftOsc.connect(this.leftGain);
			this.rightOsc.connect(this.rightGain);

			this.leftGain.connect(this.mixer,0,0);
			this.rightGain.connect(this.mixer,0,1);

			this.leftOsc.noteOn(1);
			this.leftModOsc.noteOn(1);
			
			this.rightOsc.noteOn(1);
			this.rightModOsc.noteOn(1);			

			this.mixer.connect(this.context.destination);

			this.lfvar = 'y';
			this.lmvar = 'z';
				
			this.rfvar = 'z';
			this.rmvar = 'y';				
				
			this.balancevar = 'x';
			this.dynamicbalance = true;

			this.setScales();

		}
		else {
			this.tick = this.quietTick;
		}	
								
	}	
